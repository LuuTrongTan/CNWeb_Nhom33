const express = require('express');
const goongController = require('../controllers/goong.controller');
const router = express.Router();

router.route('/reverse-geocoding').get(goongController.reverseGeocoding);

router.route('/forward-geocoding').get(goongController.forwardGeocoding);

router.route('/getDistance').post(goongController.getDistance);

module.exports = router;
