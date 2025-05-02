const httpStatus = require('http-status');
const { Category } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Tạo mới một danh mục
 * @param {Object} categoryBody
 * @returns {Promise<Category>}
 */
const createCategory = async (categoryBody) => {
  // Kiểm tra trùng tên danh mục
  const existingCategory = await Category.findOne({ name: categoryBody.name });
  if (existingCategory) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Tên danh mục đã tồn tại');
  }

  return await Category.create(categoryBody);
};

/**
 * Lấy tất cả danh mục với các tùy chọn phân trang, tìm kiếm và lọc
 * @param {Object} options - Các tùy chọn truy vấn
 * @param {number} [options.page] - Số trang hiện tại
 * @param {number} [options.limit] - Số lượng danh mục trên mỗi trang
 * @param {string} [options.searchTerm] - Từ khóa tìm kiếm
 * @param {boolean} [options.isActive] - Lọc theo trạng thái hoạt động
 * @param {string} [options.sortBy] - Trường để sắp xếp
 * @param {string} [options.sortOrder] - Thứ tự sắp xếp (asc/desc)
 * @returns {Promise<Object>} Danh sách danh mục và thông tin phân trang
 */
const getAllCategories = async (options = {}) => {
  const { searchTerm = '', isActive, sortBy = 'createdAt', sortOrder = 'desc' } = options;

  // Xây dựng điều kiện truy vấn
  const query = {};

  // Thêm điều kiện tìm kiếm nếu có
  if (searchTerm) {
    query.$or = [{ name: { $regex: searchTerm, $options: 'i' } }, { description: { $regex: searchTerm, $options: 'i' } }];
  }

  // Lọc theo trạng thái kích hoạt nếu được chỉ định
  if (isActive !== undefined) {
    query.isActive = isActive;
  }

  // Xây dựng tùy chọn sắp xếp
  const sort = {};
  sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

  // Thực hiện tìm kiếm với phân trang
  const categories = await Category.find(query).sort(sort);

  // Đếm tổng số danh mục phù hợp với điều kiện truy vấn
  const total = await Category.countDocuments(query);

  return {
    categories,
    totalItems: total,
  };
};

/**
 * Lấy danh mục theo ID
 * @param {ObjectId} id - ID của danh mục
 * @returns {Promise<Category>}
 */
const getCategoryById = async (id) => {
  return Category.findById(id);
};

/**
 * Lấy danh mục theo slug
 * @param {string} slug - Slug của danh mục
 * @returns {Promise<Category>}
 */
const getCategoryBySlug = async (slug) => {
  return Category.findOne({ slug });
};

/**
 * Cập nhật danh mục theo ID
 * @param {ObjectId} categoryId - ID của danh mục
 * @param {Object} updateBody - Nội dung cập nhật
 * @returns {Promise<Category>}
 */
const updateCategoryById = async (categoryId, updateBody) => {
  const category = await getCategoryById(categoryId);
  if (!category) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Không tìm thấy danh mục');
  }
  // Kiểm tra trùng tên danh mục nếu có cập nhật tên
  if (updateBody.name && updateBody.name !== category.name) {
    const existingCategory = await Category.findOne({ name: updateBody.name });
    if (existingCategory) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Tên danh mục đã tồn tại');
    }
  }
  Object.assign(category, updateBody);
  await category.save();
  return category;
};

/**
 * Xóa danh mục theo ID
 * @param {ObjectId} categoryId - ID của danh mục
 * @returns {Promise<Category>}
 */
const deleteCategoryById = async (categoryId) => {
  const category = await getCategoryById(categoryId);
  if (!category) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Không tìm thấy danh mục');
  }

  // Hoặc xóa vĩnh viễn nếu cần
  await category.deleteOne();
  return category;
};

/**
 * Lấy các thống kê về danh mục
 * @returns {Promise<Object>} Các thống kê
 */
const getCategoryStats = async () => {
  const totalCategories = await Category.countDocuments();
  const activeCategories = await Category.countDocuments({ isActive: true });
  const inactiveCategories = await Category.countDocuments({ isActive: false });

  // Tìm danh mục mới nhất
  const latestCategories = await Category.find().sort({ createdAt: -1 }).limit(5);

  return {
    total: totalCategories,
    active: activeCategories,
    inactive: inactiveCategories,
    latest: latestCategories,
  };
};

/**
 * Lấy danh mục theo tagCategory (không phân biệt chữ hoa/chữ thường)
 * @param {string} tagCategory - TagCategory của danh mục
 * @returns {Promise<Array<Category>>}
 */
const getCategoriesByTagCategory = async (tagCategory) => {
  return Category.find({ tagCategory: { $regex: new RegExp(`^${tagCategory}$`, 'i') } });
};

module.exports = {
  createCategory,
  getAllCategories,
  getCategoryById,
  getCategoryBySlug,
  updateCategoryById,
  deleteCategoryById,
  getCategoryStats,
  getCategoriesByTagCategory,
};
