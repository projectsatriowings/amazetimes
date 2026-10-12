import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { authenticate } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanName = path.basename(file.originalname, ext).replace(/[^\w-]/g, '_');
    const uniqueSuffix = `${Date.now()}_${Math.round(Math.random() * 1E6)}`;
    cb(null, `${cleanName}_${uniqueSuffix}${ext}`);
  }
});

// File filter (Images, Videos, PDFs & Audio)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp|gif|pdf|mp3|ogg|wav|mp4|webm|mov|mkv|quicktime|m4v/;
  const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
  const mime = file.mimetype.toLowerCase();

  if (allowedTypes.test(ext) || allowedTypes.test(mime)) {
    cb(null, true);
  } else {
    cb(new Error('அனுமதிக்கப்பட்ட கோப்பு வடிவங்கள்: JPG, PNG, WEBP, MP4, WEBM, MOV, PDF, MP3'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 60 * 1024 * 1024 }, // 60 MB max for 60-second video clips
  fileFilter
});

const router = express.Router();

// POST /api/upload - Secure file upload
router.post('/', authenticate, upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'கோப்பு எதுவும் தேர்ந்தெடுக்கப்படவில்லை (No file uploaded)' });
    }

    const publicUrl = `/uploads/${req.file.filename}`;

    res.json({
      success: true,
      message: 'கோப்பு வெற்றிகரமாகப் பதிவேற்றப்பட்டது (File uploaded successfully)',
      url: publicUrl,
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
