import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import fs from 'fs';
import path from 'path';
import { createWorker } from 'tesseract.js';

export async function parseResume(filePath: string, mimeType: string): Promise<string> {
  try {
    const ext = path.extname(filePath).toLowerCase();

    // ── PDF ──────────────────────────────────────────────────────────────────
    if (mimeType === 'application/pdf' || ext === '.pdf') {
      const dataBuffer = fs.readFileSync(filePath);

      const data = await pdfParse(dataBuffer, { max: 0, version: 'default' });
      const text = cleanText(data.text);
      console.log(`[Parser] PDF extracted ${text.length} chars from ${data.numpages} page(s)`);

      if (text.length > 50) return text;

      // Fallback attempt
      const data2 = await pdfParse(dataBuffer);
      const text2 = cleanText(data2.text);
      console.log(`[Parser] PDF fallback extracted ${text2.length} chars`);

      if (text2.length > 0) return text2;

      throw new Error(
        'This PDF appears to be image-based (scanned). Please upload it as a PNG or JPG image instead, or export a text-based PDF from Word/Google Docs.'
      );
    }

    // ── DOCX ─────────────────────────────────────────────────────────────────
    if (
      mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      ext === '.docx'
    ) {
      const result = await mammoth.extractRawText({ path: filePath });
      const text = cleanText(result.value);
      console.log(`[Parser] DOCX extracted ${text.length} chars`);
      return text;
    }

    // ── DOC (legacy Word) ────────────────────────────────────────────────────
    if (mimeType === 'application/msword' || ext === '.doc') {
      const result = await mammoth.extractRawText({ path: filePath });
      const text = cleanText(result.value);
      console.log(`[Parser] DOC extracted ${text.length} chars`);
      return text;
    }

    // ── Plain Text ───────────────────────────────────────────────────────────
    if (mimeType === 'text/plain' || ext === '.txt') {
      const raw = fs.readFileSync(filePath, 'utf-8');
      const text = cleanText(raw);
      console.log(`[Parser] TXT extracted ${text.length} chars`);
      return text;
    }

    // ── Images — OCR via Tesseract.js ────────────────────────────────────────
    if (
      ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'].includes(mimeType) ||
      ['.png', '.jpg', '.jpeg', '.webp'].includes(ext)
    ) {
      console.log(`[Parser] Starting OCR on image: ${path.basename(filePath)}`);
      const worker = await createWorker('eng');
      try {
        const { data: { text: ocrText } } = await worker.recognize(filePath);
        const text = cleanText(ocrText);
        console.log(`[Parser] OCR extracted ${text.length} chars from image`);
        if (text.length < 20) {
          throw new Error(
            'OCR could not read enough text from this image. Please ensure the image is clear and high-resolution.'
          );
        }
        return text;
      } finally {
        await worker.terminate();
      }
    }

    throw new Error(
      'Unsupported file format. Please upload PDF, DOCX, DOC, TXT, PNG, JPG, or WEBP.'
    );

  } finally {
    if (fs.existsSync(filePath)) {
      try { fs.unlinkSync(filePath); } catch {}
    }
  }
}

function cleanText(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .replace(/[ \t]{3,}/g, '  ')
    .trim();
}
