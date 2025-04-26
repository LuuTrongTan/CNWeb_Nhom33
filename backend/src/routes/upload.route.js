const express = require('express');
const multer = require('multer');
const uploadController = require('../controllers/upload.controller');
const auth = require('../middlewares/auth');

const router = express.Router();

// Cấu hình Multer
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    // Chỉ chấp nhận hình ảnh
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận file hình ảnh'), false);
    }
  },
});

// Route upload một file
router.post('/', auth(), upload.single('file'), uploadController.uploadFile);

// Route upload nhiều file
router.post('/multiple', auth(), upload.array('files', 10), uploadController.uploadMultipleFiles);

module.exports = router; 