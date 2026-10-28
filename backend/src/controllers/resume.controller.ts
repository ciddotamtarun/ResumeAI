import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import Resume from '../models/Resume.model';
import { parseResume } from '../services/parser.service';
import { analyzeResume, generateImprovements } from '../services/resume.service';
import { AIServiceError, generateCompletion } from '../services/ai.service';

export const uploadResume = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No file uploaded' });
      return;
    }

    const provider = ((req.body.provider as string) || 'gemini') as 'openai' | 'gemini';
    const targetRole = (req.body.targetRole as string) || '';

    const rawText = await parseResume(req.file.path, req.file.mimetype);

    console.log(`[Upload] Raw text length: ${rawText?.trim().length || 0}`);
    console.log(`[Upload] Target role: ${targetRole || '(none)'}`);

    if (!rawText || rawText.trim().length < 20) {
      res.status(400).json({
        success: false,
        message:
          'Could not extract text from this file. For image resumes, ensure the image is clear and high-resolution. For PDFs, try exporting as a text-based PDF from Word/Google Docs, or upload as PNG/JPG instead.',
      });
      return;
    }

    const [analysis, improvements] = await Promise.all([
      analyzeResume(rawText, targetRole, provider),
      generateImprovements(rawText, targetRole, provider),
    ]);

    const resume = await Resume.create({
      userId: req.user!._id,
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      rawText,
      targetRole,
      analysis,
      improvements,
      aiProvider: provider,
    });

    res.status(201).json({ success: true, resume });
  } catch (error: any) {
    const statusCode = error instanceof AIServiceError ? error.statusCode : 500;
    const message = error instanceof AIServiceError
      ? error.message
      : 'Failed to process resume. Please try again.';
    console.error('[Upload] Resume processing failed', {
      errorType: error instanceof Error ? error.name : typeof error,
      statusCode,
    });
    res.status(statusCode).json({ success: false, message });
  }
};

export const getResume = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.user!._id });
    if (!resume) {
      res.status(404).json({ success: false, message: 'Resume not found' });
      return;
    }
    res.json({ success: true, resume });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllResumes = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const resumes = await Resume.find({ userId: req.user!._id })
      .select('-rawText')
      .sort({ createdAt: -1 });
    res.json({ success: true, resumes });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteResume = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const resume = await Resume.findOneAndDelete({ _id: req.params.id, userId: req.user!._id });
    if (!resume) {
      res.status(404).json({ success: false, message: 'Resume not found' });
      return;
    }
    res.json({ success: true, message: 'Resume deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};


export const analyzeBuilderResume = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { rawText, targetRole = '', provider = 'gemini', fileName = 'Manual_Resume.pdf' } = req.body;

    if (!rawText || typeof rawText !== 'string' || rawText.trim().length < 20) {
      res.status(400).json({
        success: false,
        message: 'Resume content is too short to analyze. Please provide more details in your resume sections.',
      });
      return;
    }

    const aiProvider = (provider === 'openai' ? 'openai' : 'gemini') as 'openai' | 'gemini';

    const [analysis, improvements] = await Promise.all([
      analyzeResume(rawText, targetRole, aiProvider),
      generateImprovements(rawText, targetRole, aiProvider),
    ]);

    const resume = await Resume.create({
      userId: req.user!._id,
      fileName,
      fileType: 'application/pdf',
      rawText,
      targetRole,
      analysis,
      improvements,
      aiProvider,
    });

    res.status(201).json({ success: true, resume });
  } catch (error: any) {
    const statusCode = error instanceof AIServiceError ? error.statusCode : 500;
    const message = error instanceof AIServiceError
      ? error.message
      : 'Failed to analyze resume. Please try again.';
    console.error('[AnalyzeBuilder] Failed:', error);
    res.status(statusCode).json({ success: false, message });
  }
};

export const aiAssistResume = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { action, text = '', context = '', targetRole = '', provider = 'gemini' } = req.body;
    const aiProvider = (provider === 'openai' ? 'openai' : 'gemini') as 'openai' | 'gemini';

    if (!text && action !== 'suggest-skills') {
      res.status(400).json({ success: false, message: 'Text is required for AI assistance' });
      return;
    }

    let prompt = '';
    const systemPrompt = `You are a world-class professional resume editor and career strategist.
CRITICAL INSTRUCTION: NEVER fabricate degrees, employers, certifications, dates, metrics, or factual claims.
Only rewrite, improve phrasing, highlight impact, and suggest relevant skills based strictly on provided context.
Always return valid JSON only with NO markdown wrappers or code blocks.`;

    if (action === 'improve-summary') {
      prompt = `Improve the following professional summary for a candidate${targetRole ? ` targeting the role: "${targetRole}"` : ''}.
Make it punchy, professional, results-oriented, and engaging without inventing achievements.
Original text:
"${text}"

Return a JSON object in this exact format:
{
  "improvedText": "<improved professional summary, 2-4 sentences>",
  "explanation": "<brief note on what was enhanced>"
}`;
    } else if (action === 'improve-bullet') {
      prompt = `Rewrite this resume achievement/responsibility bullet point using strong action verbs and impact-focused phrasing.
Context / Role: ${context || targetRole || 'Professional Role'}
Original bullet:
"${text}"

Return a JSON object in this exact format:
{
  "improvedText": "<concise, high-impact bullet point starting with a strong past-tense action verb>",
  "explanation": "<brief note on impact improvement>"
}`;
    } else if (action === 'suggest-skills') {
      prompt = `Suggest 8-12 highly relevant technical and soft skills for a candidate${targetRole ? ` aiming for "${targetRole}"` : ''}.
Existing skills or background info:
"${text || context || targetRole}"

Return a JSON object in this exact format:
{
  "technicalSkills": ["Skill 1", "Skill 2"],
  "softSkills": ["Skill A", "Skill B"]
}`;
    } else if (action === 'check-grammar') {
      prompt = `Check and polish the following resume text for grammar, active voice, conciseness, and ATS clarity:
"${text}"

Return a JSON object in this exact format:
{
  "improvedText": "<polished text>",
  "explanation": "<summary of corrections made>"
}`;
    } else {
      res.status(400).json({ success: false, message: `Unknown action: ${action}` });
      return;
    }

    const rawResponse = await generateCompletion(prompt, systemPrompt, aiProvider);

    let cleaned = rawResponse.trim();
    if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7);
    if (cleaned.startsWith('```')) cleaned = cleaned.slice(3);
    if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3);
    cleaned = cleaned.trim();

    try {
      const result = JSON.parse(cleaned);
      res.json({ success: true, result });
    } catch {
      res.json({
        success: true,
        result: {
          improvedText: cleaned,
          explanation: 'AI refined the content for clarity and impact.',
        },
      });
    }
  } catch (error: any) {
    console.error('[AIAssist] Error:', error);
    res.status(500).json({ success: false, message: error.message || 'AI Assistant request failed' });
  }
};
