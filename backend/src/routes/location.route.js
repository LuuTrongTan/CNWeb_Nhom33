const express = require('express');
const locationController = require('../controllers/location.controller');

const router = express.Router();

router.route('/closest-location').get(locationController.getClosestLocation);

router.route('/reverse-geocoding').get(locationController.reverseGeocoding);

module.exports = router;
