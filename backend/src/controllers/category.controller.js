const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { categoryService } = require('../services');

const createCategory = catchAsync(async (req, res) => {
  const category = await categoryService.createCategory(req.body);
  res.status(httpStatus.CREATED).send(category);
});

const getAllCategory = catchAsync(async (req, res) => {
  const category = await categoryService.getAllCategory();
  if (!category) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Category not found');
  }
  res.send(category);
});

const getCategory = catchAsync(async (req, res) => {
  const categoryId = req.query.categoryId;
  if (!categoryId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Category ID is required');
  }
  const category = await categoryService.getCategoryById(categoryId);
  if (!category) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Category not found');
  }
  res.send(category);
});

const updateCategory = catchAsync(async (req, res) => {
  const categoryId = req.query.categoryId;
  if (!categoryId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Category ID is required');
  }
  const category = await categoryService.updateCategoryById(categoryId, req.body);
  res.send(category);
});

const deleteCategory = catchAsync(async (req, res) => {
  const categoryId = req.query.categoryId;
  if (!categoryId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Category ID is required');
  }
  await categoryService.deleteCategoryById(categoryId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createCategory,
  getAllCategory,
  getCategory,
  updateCategory,
  deleteCategory,
};
