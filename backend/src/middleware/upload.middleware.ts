import multer from 'multer';
import path from 'path';
import fs from 'fs';

// On Vercel serverless environments, the root filesystem is read-only.
// We use the ephemeral writable /tmp directory in serverless environments.
const isVercel = Boolean(process.env.VERCEL);
export const uploadDir =
  process.env.UPLOAD_DIR || (isVercel ? path.join('/tmp', 'uploads') : './uploads');

try {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
} catch (err) {
  console.warn(`[WARN] Failed to initialize upload directory (${uploadDir}):`, err);
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    try {
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    } catch (err) {
      cb(err as Error, uploadDir);
    }
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `job-attachment-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
});

export const uploadAttachmentMiddleware = multer({
  storage,
  limits: {
    fileSize: Number(process.env.MAX_FILE_SIZE_BYTES) || 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|pdf|heic/;
    const extname = allowed.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowed.test(file.mimetype) || file.mimetype.startsWith('image/');
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Invalid file format. Only JPEG, PNG, WEBP, and PDF documents are allowed.'));
  },
});
