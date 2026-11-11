import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import AdmZip from 'adm-zip';
import fs from 'fs';
import path from 'path';
import { createWorker } from 'tesseract.js';

export class ParserError extends Error {
  constructor(message: string, public readonly statusCode: number = 400) {
    super(message);
    this.name = 'ParserError';
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function parseResume(filePath: string, mimeType: string): Promise<string> {
  try {
    const ext = path.extname(filePath).toLowerCase();

    // ── PDF ──────────────────────────────────────────────────────────────────
    if (mimeType === 'application/pdf' || ext === '.pdf') {
      return await parsePdf(filePath);
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

    // ── RTF ───────────────────────────────────────────────────────────────────
    if (
      ['application/rtf', 'text/rtf', 'application/x-rtf'].includes(mimeType) ||
      ext === '.rtf'
    ) {
      const raw = fs.readFileSync(filePath, 'latin1'); // RTF uses latin1 encoding
      const text = cleanText(stripRtf(raw));
      console.log(`[Parser] RTF extracted ${text.length} chars`);
      return text;
    }

    // ── ODT ───────────────────────────────────────────────────────────────────
    if (mimeType === 'application/vnd.oasis.opendocument.text' || ext === '.odt') {
      const text = cleanText(parseOdt(filePath));
      console.log(`[Parser] ODT extracted ${text.length} chars`);
      return text;
    }

    // ── Plain Text & Markdown ─────────────────────────────────────────────────
    if (
      mimeType === 'text/plain' ||
      ['text/markdown', 'text/x-markdown'].includes(mimeType) ||
      ['.txt', '.md'].includes(ext)
    ) {
      const raw = fs.readFileSync(filePath, 'utf-8');
      const text = cleanText(raw);
      console.log(`[Parser] ${ext.toUpperCase() || 'TXT'} extracted ${text.length} chars`);
      return text;
    }

    // ── HTML / HTM ────────────────────────────────────────────────────────────
    if (mimeType === 'text/html' || ['.html', '.htm'].includes(ext)) {
      const raw = fs.readFileSync(filePath, 'utf-8');
      const text = cleanText(stripHtml(raw));
      console.log(`[Parser] HTML extracted ${text.length} chars`);
      return text;
    }

    // ── Images — OCR via Tesseract.js ─────────────────────────────────────────
    if (
      ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'].includes(mimeType) ||
      ['.png', '.jpg', '.jpeg', '.webp'].includes(ext)
    ) {
      return await parseImageOcr(filePath);
    }

    throw new ParserError(
      'Unsupported file format. Allowed: PDF, DOCX, DOC, TXT, RTF, ODT, MD, HTML, PNG, JPG, WEBP.',
      400
    );
  } finally {
    // Always clean up the temporary upload
    safeUnlink(filePath);
  }
}

// ─── PDF Parser ───────────────────────────────────────────────────────────────

async function parsePdf(filePath: string): Promise<string> {
  if (!fs.existsSync(filePath)) {
    throw new ParserError('The uploaded PDF file was not found on the server.', 400);
  }

  const stats = fs.statSync(filePath);
  if (stats.size === 0) {
    throw new ParserError('The uploaded PDF file is empty (0 bytes). Please upload a valid document.', 400);
  }

  const dataBuffer = fs.readFileSync(filePath);

  let data: any;
  try {
    data = await pdfParse(dataBuffer);
  } catch (pdfErr: any) {
    const errStr = String(pdfErr?.message || pdfErr).toLowerCase();
    if (errStr.includes('password') || errStr.includes('encrypt')) {
      throw new ParserError(
        'This PDF is password-protected or encrypted. Please remove password protection before uploading.',
        400
      );
    }
    if (errStr.includes('stream must have data') || errStr.includes('no data') || errStr.includes('empty')) {
      throw new ParserError('The uploaded PDF file contains no data or is empty.', 400);
    }
    throw new ParserError(
      'The uploaded PDF file is corrupt, incomplete, or not a valid PDF document. Please export a fresh PDF and try again.',
      400
    );
  }

  const text = cleanText(data.text);
  console.log(`[Parser] PDF text extracted: ${text.length} characters from ${data.numpages || 1} page(s)`);

  if (text.length >= 50) return text;

  // Fallback with legacy options if needed
  try {
    const data2 = await pdfParse(dataBuffer, { max: 0, version: 'default' });
    const text2 = cleanText(data2.text);
    if (text2.length >= 50) {
      console.log(`[Parser] PDF fallback extracted ${text2.length} characters`);
      return text2;
    }
  } catch {
    // Ignore fallback failure and report scanned document below
  }

  throw new ParserError(
    'This PDF appears to be image-based or scanned with no selectable text. Please upload it as a PNG or JPG image for OCR text extraction, or export a text-based PDF from Word or Google Docs.',
    400
  );
}

// ─── RTF Stripper ─────────────────────────────────────────────────────────────

function stripRtf(rtf: string): string {
  // Remove embedded destinations like {\*\something ...}
  let text = rtf.replace(/\{\*?\\[^{}]+(?:\{[^{}]*\})*[^{}]*\}/g, ' ');

  // Handle paragraph marks → newlines
  text = text
    .replace(/\\par\b/gi, '\n')
    .replace(/\\line\b/gi, '\n')
    .replace(/\\page\b/gi, '\n\n')
    .replace(/\\tab\b/gi, '\t')
    .replace(/\\bullet\b/gi, '• ');

  // Decode hex-encoded characters (e.g., \'e9 → é)
  text = text.replace(/\\'([0-9a-fA-F]{2})/g, (_m, hex) =>
    String.fromCharCode(parseInt(hex, 16))
  );

  // Remove remaining RTF control words and symbols
  text = text
    .replace(/\\[a-zA-Z]+\d* ?/g, ' ')  // control words
    .replace(/\\\n/g, ' ')               // escaped newlines
    .replace(/\\\r\n/g, ' ')
    .replace(/[{}\\]/g, ' ')             // braces and backslashes
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ''); // control chars

  return text.replace(/[ \t]{3,}/g, '  ').trim();
}

// ─── ODT Parser ───────────────────────────────────────────────────────────────

function parseOdt(filePath: string): string {
  try {
    const zip = new AdmZip(filePath);
    const contentEntry = zip.getEntry('content.xml');

    if (!contentEntry) {
      throw new Error('Invalid ODT file: content.xml not found inside the archive.');
    }

    const xml = contentEntry.getData().toString('utf-8');
    return stripOdtXml(xml);
  } catch (err: any) {
    if (err.message.includes('Invalid ODT')) throw err;
    throw new Error(`Failed to read ODT file: ${err.message}`);
  }
}

function stripOdtXml(xml: string): string {
  // Preserve paragraph and heading breaks
  let text = xml
    .replace(/<text:p[^>]*>/gi, '\n')
    .replace(/<text:h[^>]*>/gi, '\n')
    .replace(/<text:line-break\/>/gi, '\n')
    .replace(/<text:tab\/>/gi, '\t')
    .replace(/<text:s[^/]?\/>/gi, ' ');

  // Strip all remaining XML tags
  text = text.replace(/<[^>]+>/g, '');

  // Decode XML entities
  text = text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_m, dec) => String.fromCharCode(parseInt(dec, 10)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_m, hex) => String.fromCharCode(parseInt(hex, 16)));

  return text;
}

// ─── HTML Stripper ────────────────────────────────────────────────────────────

function stripHtml(html: string): string {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<\/h[1-6]>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_m, dec) => String.fromCharCode(parseInt(dec, 10)));
}

// ─── OCR (Images) ─────────────────────────────────────────────────────────────

async function parseImageOcr(filePath: string): Promise<string> {
  console.log(`[Parser] Starting OCR on image: ${path.basename(filePath)}`);
  const worker = await createWorker('eng');
  try {
    const { data: { text: ocrText } } = await worker.recognize(filePath);
    const text = cleanText(ocrText);
    console.log(`[Parser] OCR extracted ${text.length} chars from image`);
    if (text.length < 20) {
      throw new Error(
        'OCR could not read enough text from this image. ' +
        'Please ensure the image is clear and high-resolution.'
      );
    }
    return text;
  } finally {
    await worker.terminate();
  }
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function cleanText(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .replace(/[ \t]{3,}/g, '  ')
    .trim();
}

function safeUnlink(filePath: string): void {
  try {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch {
    // Ignore cleanup errors
  }
}
