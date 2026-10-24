import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import { optionalAuth } from '../middleware/auth.js';

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

// Configured Multer for 100MB capacity
const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB max for e-paper PDFs & high-res media
  fileFilter
}).single('file');

const router = express.Router();

// POST /api/upload - Secure file upload up to 100MB with 413 graceful handling
router.post('/', optionalAuth, (req, res) => {
  upload(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({
          success: false,
          message: 'கோப்பின் அளவு 100MB வரம்பை தாண்டியுள்ளது. தயவுசெய்து 100MB-க்குள் உள்ள கோப்பைப் பதிவேற்றவும் (413 Payload Too Large).'
        });
      }
      return res.status(400).json({ success: false, message: `பதிவேற்றப் பிழை: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'கோப்பு எதுவும் தேர்ந்தெடுக்கப்படவில்லை (No file uploaded)' });
    }

    // Automatically strip unnecessary EXIF and metadata from uploaded images
    if (req.file.mimetype && req.file.mimetype.startsWith('image/') && !req.file.mimetype.includes('svg')) {
      try {
        const filePath = req.file.path;
        const strippedBuf = await sharp(filePath).withMetadata(false).toBuffer();
        fs.writeFileSync(filePath, strippedBuf);
      } catch (stripErr) {
        console.warn('Metadata strip warning:', stripErr.message);
      }
    }

    const publicUrl = `/uploads/${req.file.filename}`;

    res.json({
      success: true,
      message: 'கோப்பு வெற்றிகரமாகப் பதிவேற்றப்பட்டது (File uploaded successfully)',
      url: publicUrl,
      imageUrl: publicUrl,
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype
    });
  });
});

export default router;
