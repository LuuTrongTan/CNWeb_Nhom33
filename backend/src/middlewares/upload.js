// Import các thư viện cần thiết
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { v4: uuidv4 } = require('uuid'); // Import UUID
const cloudinary = require('../config/cloudinary'); // Import cấu hình Cloudinary

// Cấu hình lưu trữ với Cloudinary
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'uploads', // Thư mục trong Cloudinary
    allowed_formats: ['jpeg', 'jpg', 'png', 'gif'], // Các định dạng được phép
    public_id: (req, file) => `${file.fieldname}-${uuidv4()}`, // Tạo tên file với UUID
  },
});

// Middleware cho avatar (single upload)
const uploadAvatar = multer({
  storage,
  limits: { fileSize: 1000000 }, // Giới hạn kích thước file (1MB)
  fileFilter: (req, file, cb) => {
    console.log('Uploading file:', {
      fieldname: file.fieldname,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size
    });

    // Kiểm tra định dạng file
    if (!file.mimetype.startsWith('image/')) {
      console.error('Invalid file type:', file.mimetype);
      return cb(new Error('Chỉ chấp nhận file hình ảnh'), false);
    }

    // Kiểm tra kích thước file
    if (file.size > 1000000) {
      console.error('File too large:', file.size);
      return cb(new Error('Kích thước file không được vượt quá 1MB'), false);
    }

    cb(null, true);
  }
}).single('avatar'); // 'avatar' là tên field trong form

// Middleware cho pictures (multiple uploads)
const uploadPicture = multer({
  storage,
  limits: { fileSize: 1000000 }, // Giới hạn kích thước file (1MB)
}).array('picture', 100); // Cho phép upload tối đa 100 file

module.exports = {
  uploadAvatar,
  uploadPicture,
};
