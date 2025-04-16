const Wishlist = require('../models/wishlist.model');
const { validationResult } = require('express-validator');

// Get user's wishlist
exports.getWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const wishlist = await Wishlist.findOne({ user: userId }).populate('products.product');
    
    if (!wishlist) {
      return res.status(200).json({
        success: true,
        products: []
      });
    }
    
    res.status(200).json({
      success: true,
      products: wishlist.products
    });
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({ message: 'Server error while fetching wishlist' });
  }
};

// Add product to wishlist
exports.addToWishlist = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const userId = req.user.id;
    const { productId } = req.body;
    
    // Find user's wishlist or create one
    let wishlist = await Wishlist.findOne({ user: userId });
    
    if (!wishlist) {
      wishlist = new Wishlist({
        user: userId,
        products: []
      });
    }
    
    // Check if product already in wishlist
    const existingProduct = wishlist.products.find(
      item => item.product.toString() === productId
    );
    
    if (existingProduct) {
      return res.status(400).json({ message: 'Product already in wishlist' });
    }
    
    // Add product to wishlist
    wishlist.products.push({
      product: productId,
      addedAt: Date.now()
    });
    
    await wishlist.save();
    
    // Get updated wishlist
    const updatedWishlist = await Wishlist.findOne({ user: userId }).populate('products.product');
    
    res.status(201).json({
      success: true,
      message: 'Product added to wishlist',
      products: updatedWishlist.products
    });
  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({ message: 'Server error while adding to wishlist' });
  }
};

// Remove product from wishlist
exports.removeFromWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const productId = req.params.productId;
    
    // Find user's wishlist
    const wishlist = await Wishlist.findOne({ user: userId });
    
    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }
    
    // Check if product in wishlist
    const productIndex = wishlist.products.findIndex(
      item => item.product.toString() === productId
    );
    
    if (productIndex === -1) {
      return res.status(404).json({ message: 'Product not found in wishlist' });
    }
    
    // Remove product from wishlist
    wishlist.products.splice(productIndex, 1);
    await wishlist.save();
    
    // Get updated wishlist
    const updatedWishlist = await Wishlist.findOne({ user: userId }).populate('products.product');
    
    res.status(200).json({
      success: true,
      message: 'Product removed from wishlist',
      products: updatedWishlist ? updatedWishlist.products : []
    });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({ message: 'Server error while removing from wishlist' });
  }
};

// Clear wishlist
exports.clearWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Find and update user's wishlist
    await Wishlist.findOneAndUpdate(
      { user: userId },
      { $set: { products: [] } },
      { new: true }
    );
    
    res.status(200).json({
      success: true,
      message: 'Wishlist cleared',
      products: []
    });
  } catch (error) {
    console.error('Clear wishlist error:', error);
    res.status(500).json({ message: 'Server error while clearing wishlist' });
  }
}; 