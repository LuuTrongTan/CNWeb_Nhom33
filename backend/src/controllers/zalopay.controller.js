const zalopayService = require('../services/zalopay.service');

const createPayment = async (req, res) => {
  try {
    const result = await zalopayService.createOrder(req.body);
    res.status(200).json(result);
  } catch (err) {
    console.error('Payment error:', err);
    res.status(500).json({ message: 'Payment failed' });
  }
};

const callbackHandler = (req, res) => {
  const { data, mac } = req.body;
  const result = zalopayService.verifyCallback(data, mac);
  res.json({ return_code: result.code, return_message: result.message });
};

const checkStatus = async (req, res) => {
  try {
    const result = await zalopayService.queryOrderStatus(req.body.app_trans_id);
    res.status(200).json(result);
  } catch (err) {
    console.error('Query error:', err);
    res.status(500).json({ message: 'Query failed' });
  }
};

module.exports = { createPayment, callbackHandler, checkStatus };
