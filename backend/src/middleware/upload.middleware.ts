import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';

const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const MAX_FILE_SIZE_MB = parseInt(process.env.MAX_UPLOAD_MB || '10', 10);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `resume-${uniqueSuffix}${path.extname(file.originalname).toLowerCase()}`);
  },
});

const ALLOWED_MIME_TYPES = new Set([
  // Documents
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/msword',                                                       // .doc
  'text/plain',                                                               // .txt
  // RTF
  'application/rtf',
  'text/rtf',
  'application/x-rtf',
  // ODT
  'application/vnd.oasis.opendocument.text',
  // Markdown
  'text/markdown',
  'text/x-markdown',
  // HTML
  'text/html',
  // Images (for scanned resumes — processed via OCR)
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
]);

const ALLOWED_EXTENSIONS = new Set([
  '.pdf', '.docx', '.doc', '.txt',
  '.rtf', '.odt', '.md', '.html', '.htm',
  '.png', '.jpg', '.jpeg', '.webp',
]);

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ALLOWED_MIME_TYPES.has(file.mimetype) || ALLOWED_EXTENSIONS.has(ext)) {
    cb(null, true);
  } else {
    cb(new Error(
      `Unsupported file type "${ext || file.mimetype}". Allowed: PDF, DOCX, DOC, TXT, RTF, ODT, MD, HTML, PNG, JPG, WEBP`
    ));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE_MB * 1024 * 1024 },
});
