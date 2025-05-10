const express = require('express');
const router = express.Router();
const momoController = require('../controllers/momo.controller');

router.post('/create', momoController.createPayment);

// router.get('/callback', momoController.callbackMomoPayment);
module.exports = router;
