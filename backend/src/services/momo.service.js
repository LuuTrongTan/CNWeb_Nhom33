const crypto = require('crypto');
const config = require('../config/momo');
const axios = require('axios');

exports.createMomoPayment = async (amount, orderInfo = 'Pay with MoMo') => {
  const requestId = config.partnerCode + new Date().getTime();
  const orderId = requestId;
  const requestType = 'payWithMethod';
  const extraData = '';
  const autoCapture = true;
  const lang = 'vi';

  const rawSignature = `accessKey=${config.accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${config.ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${config.partnerCode}&redirectUrl=${config.redirectUrl}&requestId=${requestId}&requestType=${requestType}`;

  const signature = crypto.createHmac('sha256', config.secretKey).update(rawSignature).digest('hex');

  const requestBody = JSON.stringify({
    partnerCode: config.partnerCode,
    partnerName: 'Test',
    storeId: 'MomoTestStore',
    requestId,
    amount,
    orderId,
    orderInfo,
    redirectUrl: config.redirectUrl,
    ipnUrl: config.ipnUrl,
    lang,
    requestType,
    autoCapture,
    extraData,
    signature,
  });

  const options = {
    method: 'POST',
    url: 'https://test-payment.momo.vn/v2/gateway/api/create',
    data: requestBody,
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(requestBody),
    },
  };

  let result;
  try {
    result = await axios(options);
    return result.data;
  } catch (error) {
    console.error('Lỗi khi gọi API Momo:', error.message);
  }
};

exports.callbackMomoPayment = async (res, req) => {
  console.log(res.body);
  return res.body;
};
