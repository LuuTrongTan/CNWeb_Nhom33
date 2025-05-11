const axios = require('axios');
const CryptoJS = require('crypto-js');
const moment = require('moment');
const qs = require('qs');
const config = require('../config/zalopay');

const createOrder = async (orderData) => {
  const transID = Math.floor(Math.random() * 1000000);
  const embed_data = { redirecturl: config.redirect_url };
  const items = orderData.items;

  // const order = {
  //   app_id: config.app_id,
  //   app_trans_id: `${moment().format('YYMMDD')}_${transID}`,
  //   app_user: 'user123',
  //   app_time: Date.now(),
  //   item: JSON.stringify(items),
  //   embed_data: JSON.stringify(embed_data),
  //   amount: 1000,
  //   callback_url: config.callback_url,
  //   description: `Lazada - Payment for the order #${transID}`,
  //   bank_code: '',
  // };

  const order = {
    app_id: config.app_id,
    app_trans_id: `${moment().format('YYMMDD')}_${transID}`,
    app_user: orderData.user,
    app_time: Date.now(),
    item: JSON.stringify(items),
    embed_data: JSON.stringify(embed_data),
    amount: orderData.amount,
    callback_url: config.callback_url,
    description: `Lazada - Payment for the order #${transID}`,
    bank_code: '',
  };

  const data = `${config.app_id}|${order.app_trans_id}|${order.app_user}|${order.amount}|${order.app_time}|${order.embed_data}|${order.item}`;
  order.mac = CryptoJS.HmacSHA256(data, config.key1).toString();

  const result = await axios.post(config.endpoint, null, { params: order });
  return {
    result: result.data,
    app_trans_id: order.app_trans_id,
  };
};

const verifyCallback = (dataStr, reqMac) => {
  const mac = CryptoJS.HmacSHA256(dataStr, config.key2).toString();
  if (mac !== reqMac) {
    return { code: -1, message: 'mac not equal' };
  }
  const dataJson = JSON.parse(dataStr);
  console.log("update order's status = success where app_trans_id =", dataJson['app_trans_id']);
  return { code: 1, message: 'success' };
};

const queryOrderStatus = async (app_trans_id) => {
  const postData = {
    app_id: config.app_id,
    app_trans_id,
  };
  const data = `${postData.app_id}|${postData.app_trans_id}|${config.key1}`;
  postData.mac = CryptoJS.HmacSHA256(data, config.key1).toString();

  const result = await axios.post('https://sb-openapi.zalopay.vn/v2/query', qs.stringify(postData), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  return result.data;
};

module.exports = { createOrder, verifyCallback, queryOrderStatus };
