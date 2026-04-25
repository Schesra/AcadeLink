const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const authenticateToken = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');

// Tạo thư mục uploads nếu chưa có
const uploadDir = path.join(__dirname, '../../uploads/thumbnails');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `thumb_${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Chỉ chấp nhận file ảnh (jpg, png, webp, gif)'));
  },
});

// POST /api/upload/thumbnail
router.post('/thumbnail', authenticateToken, checkRole(['instructor', 'admin']), (req, res) => {
  upload.single('thumbnail')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'Không có file được upload' });
    }
    const url = `/uploads/thumbnails/${req.file.filename}`;
    res.json({ url });
  });
});

module.exports = router;
