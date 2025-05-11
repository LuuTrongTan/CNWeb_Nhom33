const express = require('express');
const router = express.Router();
const zalopayController = require('../controllers/zalopay.controller');

router.post('/payment', zalopayController.createPayment);
router.post('/callback', zalopayController.callbackHandler);
router.post('/check-status-order', zalopayController.checkStatus);
module.exports = router;
