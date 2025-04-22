const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Vui lòng nhập tên sản phẩm'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Vui lòng nhập mô tả sản phẩm']
    },
    price: {
        type: Number,
        required: [true, 'Vui lòng nhập giá sản phẩm'],
        min: [0, 'Giá sản phẩm không thể âm']
    },
    images: [{
        type: String,
        required: [true, 'Vui lòng thêm ít nhất một ảnh sản phẩm']
    }],
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'Vui lòng chọn danh mục sản phẩm']
    },
    stock: {
        type: Number,
        required: [true, 'Vui lòng nhập số lượng sản phẩm'],
        min: [0, 'Số lượng sản phẩm không thể âm']
    },
    ratings: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        rating: {
            type: Number,
            min: 1,
            max: 5
        },
        comment: String
    }],
    averageRating: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    featured: {
        type: Boolean,
        default: false
    },
    discount: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    attributes: [{
        name: String,
        value: String
    }]
}, {
    timestamps: true
});

// Calculate average rating when a new rating is added
productSchema.pre('save', function(next) {
    if (this.ratings.length > 0) {
        const sum = this.ratings.reduce((acc, rating) => acc + rating.rating, 0);
        this.averageRating = sum / this.ratings.length;
    }
    next();
});

// Check if model exists before creating it
const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

module.exports = Product; 