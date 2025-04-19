const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { pictureService } = require('../services');
const ApiError = require('../utils/ApiError');

/**
 * Upload file
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @returns {Promise<Object>} - URL của file đã upload
 */
const uploadFile = catchAsync(async (req, res) => {
  if (!req.file) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Vui lòng cung cấp file để upload');
  }
  
  try {
    const result = await pictureService.createPicture(req, res);
    
    // Trả về URL của file đã upload
    return res.status(httpStatus.CREATED).send({
      status: 'success',
      url: result.url,
      filename: result.filename,
    });
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Lỗi khi upload file');
  }
});

/**
 * Upload nhiều file
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @returns {Promise<Object>} - Danh sách URL của các file đã upload
 */
const uploadMultipleFiles = catchAsync(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Vui lòng cung cấp ít nhất một file để upload');
  }
  
  try {
    const uploadPromises = req.files.map(async (file) => {
      // Tạo một request giả để xử lý từng file
      const fileReq = { file };
      const result = await pictureService.createPicture(fileReq, res);
      return {
        url: result.url,
        filename: result.filename,
      };
    });
    
    const results = await Promise.all(uploadPromises);
    
    return res.status(httpStatus.CREATED).send({
      status: 'success',
      files: results,
    });
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Lỗi khi upload files');
  }
});

module.exports = {
  uploadFile,
  uploadMultipleFiles,
}; 