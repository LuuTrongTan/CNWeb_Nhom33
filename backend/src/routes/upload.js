const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const auth = require('../middlewares/auth');

// Cấu hình Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Kiểm tra cấu hình Cloudinary
console.log('Cloudinary Config:', {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY ? '***' : 'missing',
  api_secret: process.env.CLOUDINARY_API_SECRET ? '***' : 'missing'
});

// Cấu hình Multer với Cloudinary Storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'avatars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
    transformation: [{ width: 500, height: 500, crop: 'fill' }]
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB
  },
  fileFilter: (req, file, cb) => {
    console.log('File being uploaded:', {
      fieldname: file.fieldname,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size
    });

    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận file hình ảnh'), false);
    }
  }
});

// Route GET để kiểm tra kết nối
router.get('/', (req, res) => {
  res.status(200).json({ message: 'Upload endpoint is working' });
});

// Route POST để upload file
router.post('/', auth(), upload.single('avatar'), async (req, res) => {
  try {
    console.log('Upload request received:', {
      file: req.file,
      body: req.body,
      headers: req.headers
    });

    if (!req.file) {
      console.log('No file in request');
      return res.status(400).json({ message: 'Không có file được tải lên' });
    }

    // Lấy URL từ Cloudinary response
    const cloudinaryUrl = req.file.path;
    console.log('File uploaded successfully:', {
      path: req.file.path,
      url: cloudinaryUrl
    });

    return res.status(200).json({
      message: 'Upload thành công',
      url: cloudinaryUrl
    });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({
      message: 'Lỗi khi upload file',
      error: error.message
    });
  }
});

// Xử lý lỗi multer
router.use((err, req, res, next) => {
  console.error('Multer error:', err);
  
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'Kích thước file quá lớn. Tối đa 2MB' });
    }
    return res.status(400).json({ message: err.message });
  }
  
  if (err.name === 'CloudinaryError') {
    return res.status(500).json({ message: 'Lỗi khi upload lên Cloudinary' });
  }
  
  next(err);
});

module.exports = router; 