const User = require('../models/user.model');
const { validationResult } = require('express-validator');

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await User.findById(userId).select('-password -twoFactorAuth.secret');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error while fetching profile' });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const userId = req.user.id;
    const { name, phone, bio } = req.body;
    
    // Build profile object
    const profileFields = {};
    if (name) profileFields.name = name;
    if (phone || bio) {
      profileFields.profile = {};
      if (phone) profileFields.profile.phone = phone;
      if (bio) profileFields.profile.bio = bio;
    }
    
    // Update user
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: profileFields },
      { new: true, runValidators: true }
    ).select('-password -twoFactorAuth.secret');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error while updating profile' });
  }
};

// Update password
exports.updatePassword = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;
    
    // Get user
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({ message: 'Server error while updating password' });
  }
};

// Add shipping address
exports.addAddress = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const userId = req.user.id;
    const { street, city, state, zipCode, country, isDefault } = req.body;
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Create new address
    const newAddress = {
      street,
      city,
      state,
      zipCode,
      country,
      isDefault: isDefault || false
    };
    
    // If this address is default, unset other default addresses
    if (newAddress.isDefault && user.addresses.length > 0) {
      user.addresses.forEach(address => {
        address.isDefault = false;
      });
    }
    
    // Add new address
    user.addresses.push(newAddress);
    await user.save();
    
    res.status(201).json({
      success: true,
      message: 'Address added successfully',
      addresses: user.addresses
    });
  } catch (error) {
    console.error('Add address error:', error);
    res.status(500).json({ message: 'Server error while adding address' });
  }
};

// Update shipping address
exports.updateAddress = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const userId = req.user.id;
    const addressId = req.params.addressId;
    const { street, city, state, zipCode, country, isDefault } = req.body;
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Find address in user's addresses
    const addressIndex = user.addresses.findIndex(a => a._id.toString() === addressId);
    
    if (addressIndex === -1) {
      return res.status(404).json({ message: 'Address not found' });
    }
    
    // Update address fields
    if (street) user.addresses[addressIndex].street = street;
    if (city) user.addresses[addressIndex].city = city;
    if (state) user.addresses[addressIndex].state = state;
    if (zipCode) user.addresses[addressIndex].zipCode = zipCode;
    if (country) user.addresses[addressIndex].country = country;
    
    // Handle default address
    if (isDefault !== undefined) {
      // If setting this address as default, unset other default addresses
      if (isDefault && user.addresses.length > 0) {
        user.addresses.forEach(address => {
          address.isDefault = false;
        });
      }
      user.addresses[addressIndex].isDefault = isDefault;
    }
    
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Address updated successfully',
      addresses: user.addresses
    });
  } catch (error) {
    console.error('Update address error:', error);
    res.status(500).json({ message: 'Server error while updating address' });
  }
};

// Delete shipping address
exports.deleteAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const addressId = req.params.addressId;
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Find address index
    const addressIndex = user.addresses.findIndex(a => a._id.toString() === addressId);
    
    if (addressIndex === -1) {
      return res.status(404).json({ message: 'Address not found' });
    }
    
    // Remove address
    user.addresses.splice(addressIndex, 1);
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Address deleted successfully',
      addresses: user.addresses
    });
  } catch (error) {
    console.error('Delete address error:', error);
    res.status(500).json({ message: 'Server error while deleting address' });
  }
}; 