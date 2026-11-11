import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import ResumeDraft from '../models/ResumeDraft.model';
import Resume from '../models/Resume.model';
import { analyzeResume, generateImprovements } from '../services/resume.service';
import { generateCompletion } from '../services/ai.service';

/**
 * Converts structured resume data into clean text for ATS analysis.
 */
export function resumeDataToPlainText(data: any): string {
  if (!data) return '';
  const lines: string[] = [];

  // Personal Info
  const p = data.personalInfo || {};
  if (p.fullName) lines.push(p.fullName.toUpperCase());
  if (p.jobTitle) lines.push(p.jobTitle);
  const contactParts = [p.email, p.phone, p.location, p.linkedin, p.github, p.website].filter(Boolean);
  if (contactParts.length) lines.push(contactParts.join(' | '));
  lines.push('');

  // Summary
  if (data.summary?.trim()) {
    lines.push('PROFESSIONAL SUMMARY');
    lines.push(data.summary.trim());
    lines.push('');
  }

  // Work Experience
  if (Array.isArray(data.experience) && data.experience.length) {
    lines.push('WORK EXPERIENCE');
    data.experience.forEach((exp: any) => {
      const header = [exp.title, exp.company, exp.location].filter(Boolean).join(' - ');
      const dates = [exp.startDate, exp.current ? 'Present' : exp.endDate].filter(Boolean).join(' - ');
      lines.push(`${header}${dates ? ` (${dates})` : ''}`);
      if (Array.isArray(exp.bullets)) {
        exp.bullets.forEach((b: string) => {
          if (b?.trim()) lines.push(`• ${b.trim()}`);
        });
      } else if (exp.description?.trim()) {
        lines.push(exp.description.trim());
      }
      lines.push('');
    });
  }

  // Projects
  if (Array.isArray(data.projects) && data.projects.length) {
    lines.push('PROJECTS');
    data.projects.forEach((proj: any) => {
      const links = [proj.projectUrl, proj.githubUrl].filter(Boolean).join(' | ');
      lines.push(`${proj.title}${links ? ` (${links})` : ''}`);
      if (Array.isArray(proj.technologies) && proj.technologies.length) {
        lines.push(`Technologies: ${proj.technologies.join(', ')}`);
      }
      if (proj.description?.trim()) {
        lines.push(proj.description.trim());
      }
      if (Array.isArray(proj.bullets)) {
        proj.bullets.forEach((b: string) => {
          if (b?.trim()) lines.push(`• ${b.trim()}`);
        });
      }
      lines.push('');
    });
  }

  // Education
  if (Array.isArray(data.education) && data.education.length) {
    lines.push('EDUCATION');
    data.education.forEach((edu: any) => {
      const degree = [edu.degree, edu.fieldOfStudy].filter(Boolean).join(' in ');
      const dates = [edu.startDate, edu.endDate].filter(Boolean).join(' - ');
      lines.push(`${degree} - ${edu.institution}${dates ? ` (${dates})` : ''}`);
      if (edu.gpa) lines.push(`GPA / Grade: ${edu.gpa}`);
      if (edu.description) lines.push(edu.description);
      lines.push('');
    });
  }

  // Skills
  const techSkills = Array.isArray(data.skills?.technical)
    ? data.skills.technical.map((s: any) => (typeof s === 'string' ? s : s?.name)).filter(Boolean)
    : [];
  const softSkills = Array.isArray(data.skills?.soft)
    ? data.skills.soft.map((s: any) => (typeof s === 'string' ? s : s?.name)).filter(Boolean)
    : [];

  if (techSkills.length || softSkills.length) {
    lines.push('SKILLS');
    if (techSkills.length) lines.push(`Technical Skills: ${techSkills.join(', ')}`);
    if (softSkills.length) lines.push(`Soft Skills: ${softSkills.join(', ')}`);
    lines.push('');
  }

  // Additional Sections
  const add = data.additional || {};
  if (Array.isArray(add.certifications) && add.certifications.length) {
    lines.push('CERTIFICATIONS');
    add.certifications.forEach((c: any) => {
      lines.push(`• ${c.name} - ${c.issuer}${c.date ? ` (${c.date})` : ''}`);
    });
    lines.push('');
  }

  if (Array.isArray(add.achievements) && add.achievements.length) {
    lines.push('ACHIEVEMENTS');
    add.achievements.forEach((a: any) => {
      lines.push(`• ${a.title}: ${a.description || ''}`);
    });
    lines.push('');
  }

  if (Array.isArray(add.languages) && add.languages.length) {
    lines.push('LANGUAGES');
    const langs = add.languages.map((l: any) => `${l.language} (${l.proficiency || 'Proficient'})`);
    lines.push(langs.join(', '));
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * List all saved resume drafts for the current user.
 */
export const listDrafts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const drafts = await ResumeDraft.find({ userId: req.user!._id })
      .select('_id title targetRole template updatedAt createdAt')
      .sort({ updatedAt: -1 });

    res.json({ success: true, drafts });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch resume drafts.' });
  }
};

/**
 * Get a specific resume draft by ID.
 */
export const getDraft = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const draft = await ResumeDraft.findOne({ _id: req.params.id, userId: req.user!._id });
    if (!draft) {
      res.status(404).json({ success: false, message: 'Resume draft not found.' });
      return;
    }
    res.json({ success: true, draft });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch resume draft.' });
  }
};

/**
 * Create or update a resume draft.
 */
export const saveDraft = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id, _id, title, targetRole, template, data } = req.body;
    const draftId = id || _id;

    if (!data) {
      res.status(400).json({ success: false, message: 'Resume data is required.' });
      return;
    }

    const cleanTitle = (title || data?.personalInfo?.fullName || 'Untitled Resume').trim();
    const cleanRole = (targetRole || data?.personalInfo?.jobTitle || '').trim();
    const cleanTemplate = ['classic', 'modern', 'technical'].includes(template) ? template : 'classic';

    let draft;
    if (draftId) {
      draft = await ResumeDraft.findOneAndUpdate(
        { _id: draftId, userId: req.user!._id },
        {
          title: cleanTitle,
          targetRole: cleanRole,
          template: cleanTemplate,
          data,
        },
        { new: true, runValidators: true }
      );

      if (!draft) {
        // If draftId provided was invalid or deleted, create fresh one
        draft = await ResumeDraft.create({
          userId: req.user!._id,
          title: cleanTitle,
          targetRole: cleanRole,
          template: cleanTemplate,
          data,
        });
      }
    } else {
      draft = await ResumeDraft.create({
        userId: req.user!._id,
        title: cleanTitle,
        targetRole: cleanRole,
        template: cleanTemplate,
        data,
      });
    }

    res.status(200).json({ success: true, draft });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to save resume draft.' });
  }
};

/**
 * Rename a resume draft.
 */
export const renameDraft = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title } = req.body;
    if (!title?.trim()) {
      res.status(400).json({ success: false, message: 'New title is required.' });
      return;
    }

    const draft = await ResumeDraft.findOneAndUpdate(
      { _id: req.params.id, userId: req.user!._id },
      { title: title.trim() },
      { new: true }
    );

    if (!draft) {
      res.status(404).json({ success: false, message: 'Resume draft not found.' });
      return;
    }

    res.json({ success: true, draft });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to rename resume draft.' });
  }
};

/**
 * Delete a resume draft.
 */
export const deleteDraft = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const draft = await ResumeDraft.findOneAndDelete({ _id: req.params.id, userId: req.user!._id });
    if (!draft) {
      res.status(404).json({ success: false, message: 'Resume draft not found.' });
      return;
    }
    res.json({ success: true, message: 'Resume draft deleted successfully.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to delete resume draft.' });
  }
};

/**
 * AI Assistance actions for Resume Builder:
 * - improve-summary
 * - polish-bullet
 * - suggest-skills
 * - grammar-fix
 */
export const aiAssist = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { type, text, role, context } = req.body;

    if (!type) {
      res.status(400).json({ success: false, message: 'Action type is required.' });
      return;
    }

    let systemPrompt = '';
    let userPrompt = '';

    switch (type) {
      case 'improve-summary':
        systemPrompt = `You are an executive resume writing expert.
Improve the candidate's professional summary.
Guidelines:
- Max 3-4 concise, impactful sentences.
- Highlight candidate's core strengths, years of experience (if mentioned), and domain expertise.
- Use strong, active professional tone.
- CRITICAL: DO NOT invent degrees, employers, certifications, dates, or numerical results.
- Return ONLY the improved summary text, with no introductory or concluding remarks.`;
        userPrompt = `Target Role: ${role || 'Software Professional'}
Current Summary:
${text || 'Experienced professional with a strong track record of success.'}`;
        break;

      case 'polish-bullet':
        systemPrompt = `You are a technical recruiter and resume editor.
Rewrite the resume bullet point using Google's XYZ formula ("Accomplished [X] as measured by [Y], by doing [Z]").
Guidelines:
- Start with a strong action verb (e.g. Engineered, Spearheaded, Optimized, Orchestrated, Automated).
- Emphasize business or engineering impact and technical craft.
- CRITICAL: DO NOT invent false metrics or false technologies. If metrics were not in the original text, frame impact cleanly with realistic engineering focus.
- Return ONLY the polished single bullet point text (no bullet symbol prefix, no quotes).`;
        userPrompt = `Role Context: ${role || 'Engineer'}
Original Bullet:
${text || 'Worked on backend APIs and fixed bugs'}`;
        break;

      case 'suggest-skills':
        systemPrompt = `You are a technical career advisor.
Based on the candidate's job role and experience, suggest 6-8 relevant, high-demand technical and soft skills.
CRITICAL: Return ONLY a valid JSON array of strings, e.g. ["TypeScript", "Next.js", "Docker", "RESTful APIs", "System Architecture"]. No markdown fences or commentary.`;
        userPrompt = `Target Job Role: ${role || 'Full Stack Developer'}
Experience Context:
${text || context || 'Building modern web applications'}`;
        break;

      case 'grammar-fix':
      default:
        systemPrompt = `You are a professional resume proofreader.
Fix all grammatical, spelling, and punctuation errors in the provided text while preserving the candidate's authentic voice and technical meaning.
Return ONLY the corrected text without explanations or commentary.`;
        userPrompt = `Text to correct:
${text || ''}`;
        break;
    }

    try {
      const completion = await generateCompletion(userPrompt, systemPrompt, 'gemini');
      let cleanOutput = completion.trim();

      if (type === 'suggest-skills') {
        try {
          const parsed = JSON.parse(cleanOutput.replace(/^```json\s*|\s*```$/g, ''));
          res.json({ success: true, result: parsed });
          return;
        } catch {
          // Fallback array if JSON parsing fails
          const items = cleanOutput
            .split(/[\n,]+/)
            .map((s) => s.replace(/^[0-9.-•*\s]+/, '').trim())
            .filter(Boolean)
            .slice(0, 8);
          res.json({ success: true, result: items });
          return;
        }
      }

      // Strip accidental quotes or markdown fences
      cleanOutput = cleanOutput.replace(/^["'`]|["'`]$/g, '').trim();
      res.json({ success: true, result: cleanOutput });
    } catch (aiErr: any) {
      // Graceful fallback if AI is unavailable
      let fallback = text;
      if (type === 'improve-summary') {
        fallback = `Results-driven ${role || 'Professional'} with demonstrable expertise in designing scalable solutions and driving engineering excellence. Proven track record of collaborating across cross-functional teams to deliver high-quality, impactful outcomes.`;
      } else if (type === 'polish-bullet') {
        fallback = `Optimized application performance and streamlined core functionality, improving maintainability and system reliability.`;
      } else if (type === 'suggest-skills') {
        fallback = ['Problem Solving', 'System Design', 'Git Version Control', 'Agile / Scrum', 'CI/CD Pipelines'];
      }
      res.json({ success: true, result: fallback, fallback: true });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'AI assist action failed.' });
  }
};

/**
 * Converts the active resume draft into structured text, runs AI analysis,
 * and saves into the Resume collection for the Resume Studio / Reports.
 */
export const analyzeDraft = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { draftId, resumeData, targetRole } = req.body;
    const data = resumeData;

    if (!data) {
      res.status(400).json({ success: false, message: 'Resume data is required for analysis.' });
      return;
    }

    const rawText = resumeDataToPlainText(data);
    const candidateName = (data.personalInfo?.fullName || 'Candidate').trim();
    const effectiveRole = (targetRole || data.personalInfo?.jobTitle || 'Software Engineer').trim();

    if (!rawText || rawText.trim().length < 50) {
      res.status(400).json({
        success: false,
        message: 'Your resume has very little content. Please add personal info, experience, or education before analyzing.',
      });
      return;
    }

    // 1. Run AI analysis & improvements concurrently
    const [analysis, improvements] = await Promise.all([
      analyzeResume(rawText, effectiveRole, 'gemini'),
      generateImprovements(rawText, effectiveRole, 'gemini'),
    ]);

    // 2. Persist to Resume collection
    const safeName = candidateName.replace(/[^a-zA-Z0-9_-]/g, '_');
    const resume = await Resume.create({
      userId: req.user!._id,
      fileName: `${safeName}_Resume_Builder.pdf`,
      fileType: 'application/pdf',
      rawText,
      targetRole: effectiveRole,
      analysis,
      improvements,
      aiProvider: 'gemini',
    });

    res.status(201).json({
      success: true,
      resumeId: resume._id,
      message: 'Resume analyzed successfully.',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to analyze resume.',
    });
  }
};
