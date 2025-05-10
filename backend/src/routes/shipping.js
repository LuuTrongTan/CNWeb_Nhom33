const express = require('express');
const router = express.Router();
const { calculateShippingFee } = require('../utils/shipping');

// Route tính phí ship
router.post('/calculate', async (req, res) => {
  try {
    const { city, district, ward, address, shippingMethod } = req.body;
    
    if (!city || !district || !ward || !address) {
      return res.status(400).json({ 
        message: 'Vui lòng cung cấp đầy đủ thông tin địa chỉ' 
      });
    }

    const fee = await calculateShippingFee({
      city,
      district, 
      ward,
      address,
      shippingMethod: shippingMethod || 'standard'
    });

    res.json({ fee });
  } catch (error) {
    console.error('Error calculating shipping fee:', error);
    res.status(500).json({ 
      message: 'Có lỗi xảy ra khi tính phí vận chuyển'
    });
  }
});

module.exports = router; 