const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const locationService = require('../services/location.service');

const reverseGeocoding = catchAsync(async (req, res) => {
  const location = await locationService.reverseGeocoding(req, res);
  // console.log(location);
  res.json(location);
});

const getClosestLocation = catchAsync(async (req, res) => {
  const { lat, lng } = req.query;
  const location = await locationService.getClosestLocation({ lat, lng });
  res.send({ code: httpStatus.OK, result: location });
});

module.exports = {
  reverseGeocoding,
  getClosestLocation,
};
