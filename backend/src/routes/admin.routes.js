const express = require('express');
const router = express.Router();
// const { adminAuth } = require('../middleware/auth.middleware');
const { adminAuth } = require('../middlewares/auth.middleware');
const User = require('../models/User');
const Product = require('../models/Product');
const cloudinary = require('cloudinary').v2;

// Cấu hình Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Quản lý tài khoản
router.get('/users', adminAuth, async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
});

router.put('/users/:id', adminAuth, async (req, res) => {
    try {
        const { role, isActive } = req.body;
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { role, isActive },
            { new: true }
        ).select('-password');
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
});

// Upload avatar cho user
router.post('/users/:id/avatar', adminAuth, async (req, res) => {
    try {
        if (!req.files || !req.files.avatar) {
            return res.status(400).json({ message: 'Không tìm thấy file ảnh' });
        }

        const avatar = req.files.avatar;
        const result = await cloudinary.uploader.upload(avatar.tempFilePath, {
            folder: 'user_avatars',
            width: 150,
            height: 150,
            crop: 'fill'
        });

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { avatar: result.secure_url },
            { new: true }
        ).select('-password');

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
});

// Quản lý sản phẩm
router.post('/products', adminAuth, async (req, res) => {
    try {
        const product = new Product(req.body);
        await product.save();
        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
});

router.put('/products/:id', adminAuth, async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
});

router.delete('/products/:id', adminAuth, async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: 'Xóa sản phẩm thành công' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
});

// Upload ảnh cho sản phẩm
router.post('/products/:id/images', adminAuth, async (req, res) => {
    try {
        if (!req.files || !req.files.images) {
            return res.status(400).json({ message: 'Không tìm thấy file ảnh' });
        }

        const images = Array.isArray(req.files.images) ? req.files.images : [req.files.images];
        const uploadedImages = [];

        for (const image of images) {
            const result = await cloudinary.uploader.upload(image.tempFilePath, {
                folder: 'product_images',
                width: 800,
                height: 800,
                crop: 'limit'
            });
            uploadedImages.push(result.secure_url);
        }

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { $push: { images: { $each: uploadedImages } } },
            { new: true }
        );

        res.json(product);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
});

// Xóa ảnh của sản phẩm
router.delete('/products/:id/images/:imageUrl', adminAuth, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
        }

        const imageUrl = req.params.imageUrl;
        const publicId = imageUrl.split('/').pop().split('.')[0];

        await cloudinary.uploader.destroy(`product_images/${publicId}`);
        
        product.images = product.images.filter(img => img !== imageUrl);
        await product.save();

        res.json(product);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
});

module.exports = router; 