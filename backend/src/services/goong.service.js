const axios = require('axios');
const config = require('../config/config');

// Hàm dùng lại để lấy tọa độ từ địa chỉ
const forwardGeocodingRaw = async (address) => {
  const apiKey = config.goong.apiKey;
  const response = await axios.get(
    `https://rsapi.goong.io/geocode?address=${encodeURIComponent(address)}&api_key=${apiKey}`
  );
  return response.data;
};

// API: lấy địa chỉ từ tọa độ
const reverseGeocoding = async (req, res) => {
  try {
    const { lat, lng } = req.query;
    const apiKey = config.goong.apiKey;
    const response = await axios.get(`https://rsapi.goong.io/Geocode?latlng=${lat},${lng}&api_key=${apiKey}`);
    const { plus_code, results } = response.data;
    res.json({ plus_code, results });
  } catch (err) {
    console.error('Lỗi reverseGeocoding:', err.message);
    res.status(500).json({ message: 'Lỗi reverse geocoding' });
  }
};

// API: lấy tọa độ từ địa chỉ
const forwardGeocoding = async (req, res) => {
  try {
    const address = req.query.address;
    const data = await forwardGeocodingRaw(address);
    res.json(data);
  } catch (err) {
    console.error('Lỗi forwardGeocoding:', err.message);
    res.status(500).json({ message: 'Lỗi forward geocoding' });
  }
};

// API: tính khoảng cách giữa 2 địa chỉ
const getDistance = async (req, res) => {
  try {
    const { address1, address2 } = req.body;
    const apiKey = config.goong.apiKey;

    const response1 = await forwardGeocodingRaw(address1);
    const response2 = await forwardGeocodingRaw(address2);
    // console.log('dfdf', response1);

    const lat1 = response1.results[0].geometry.location.lat;
    const lng1 = response1.results[0].geometry.location.lng;
    const lat2 = response2.results[0].geometry.location.lat;
    const lng2 = response2.results[0].geometry.location.lng;

    // console.log('dfdf', lng2);

    const url = `https://rsapi.goong.io/DistanceMatrix?origins=${lat1},${lng1}&destinations=${lat2},${lng2}&vehicle=car&api_key=${apiKey}`;

    const response = await axios.get(url);
    res.json(response.data);
  } catch (err) {
    console.error('Lỗi khi gọi Goong Distance Matrix:', err.message);
    res.status(500).json({ message: 'Lỗi server hoặc lỗi từ Goong API' });
  }
};

module.exports = {
  reverseGeocoding,
  forwardGeocoding,
  getDistance,
};
