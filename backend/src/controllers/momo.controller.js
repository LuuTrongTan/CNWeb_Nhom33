const momoService = require('../services/momo.service');

exports.createPayment = async (req, res) => {
  try {
    const { amount, orderInfo } = req.body;
    const result = await momoService.createMomoPayment(amount, orderInfo);
    res.json(result);
  } catch (err) {
    console.error('Momo error:', err);
    res.status(500).json({ message: 'Tạo đơn hàng thất bại' });
  }
};

exports.callbackMomoPayment = async (res, req) => {
  const result = await momoService.callbackMomoPayment();
  res.json(result);
};
