const httpStatus = require('http-status');
const { Product } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Tạo mới sản phẩm
 * @param {Object} productBody - Thông tin sản phẩm
 * @returns {Promise<Product>} Sản phẩm đã tạo
 */
const createProduct = async (productBody) => {
  return await Product.create(productBody);
};

/**
 * Tìm kiếm sản phẩm với nhiều điều kiện lọc
 * @param {Object} options - Tùy chọn tìm kiếm
 * @returns {Promise<Object>} Danh sách sản phẩm và thông tin phân trang
 */
const searchProducts = async (options = {}) => {
  const {
    page = 1,
    limit = 12,
    searchTerm = '',
    category,
    tagCategory,
    minPrice,
    maxPrice,
    hasDiscount,
    isActive,
    isNewArrival,
    isFeatured,
    isBestSeller,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    includeOutOfStock = false,
    colors = [],
    sizes = [],
    brands = [],
    tags = [],
  } = options;

  const query = {};

  // Lọc theo từ khóa tìm kiếm
  if (searchTerm) {
    query.$or = [
      { name: { $regex: searchTerm, $options: 'i' } },
      { description: { $regex: searchTerm, $options: 'i' } },
      { shortDescription: { $regex: searchTerm, $options: 'i' } },
      { 'attributes.value': { $regex: searchTerm, $options: 'i' } },
    ];
  }

  // Lọc theo danh mục
  if (category) {
    query.category = category;
  }

  // Lọc theo tagCategory (không phân biệt chữ hoa/chữ thường)
  if (tagCategory) {
    query.tagCategory = { $regex: new RegExp(`^${tagCategory}$`, 'i') };
  }

  // Lọc theo khoảng giá
  if (minPrice !== undefined || maxPrice !== undefined) {
    query.price = {};
    if (minPrice !== undefined) query.price.$gte = minPrice;
    if (maxPrice !== undefined) query.price.$lte = maxPrice;
  }

  // Lọc theo trạng thái giảm giá
  if (hasDiscount !== undefined) {
    query.hasDiscount = hasDiscount;
  }

  // Lọc theo trạng thái kích hoạt
  if (isActive !== undefined) {
    query.isActive = isActive;
  }

  // Lọc theo trạng thái mới nhất
  if (isNewArrival !== undefined) {
    query.isNewArrival = isNewArrival;
  }

  // Lọc theo trạng thái nổi bật
  if (isFeatured !== undefined) {
    query.isFeatured = isFeatured;
  }

  // Lọc theo trạng thái bán chạy
  if (isBestSeller !== undefined) {
    query.isBestSeller = isBestSeller;
  }

  // Lọc theo tình trạng kho hàng
  if (!includeOutOfStock) {
    query.stock = { $gt: 0 };
  }

  // Lọc theo màu sắc
  if (colors && colors.length > 0) {
    query.colors = { $in: colors };
  }

  // Lọc theo kích thước
  if (sizes && sizes.length > 0) {
    query.sizes = { $all: sizes };
  }

  // Lọc theo thương hiệu
  if (brands && brands.length > 0) {
    query.brand = { $in: brands };
  }

  // Lọc theo tags
  if (tags && tags.length > 0) {
    query.tags = { $in: tags };
  }

  // Sắp xếp
  const sort = {};

  // Xử lý các trường hợp sắp xếp đặc biệt
  if (sortBy === 'price' && sortOrder === 'asc') {
    sort.price = 1;
  } else if (sortBy === 'price' && sortOrder === 'desc') {
    sort.price = -1;
  } else if (sortBy === 'name' && sortOrder === 'asc') {
    sort.name = 1;
  } else if (sortBy === 'name' && sortOrder === 'desc') {
    sort.name = -1;
  } else if (sortBy === 'newest') {
    sort.createdAt = -1;
  } else if (sortBy === 'oldest') {
    sort.createdAt = 1;
  } else if (sortBy === 'rating') {
    sort.rating = -1;
  } else if (sortBy === 'bestSelling') {
    sort.soldCount = -1;
  } else {
    // Mặc định
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    sort._id = 1;
  }

  // Tính toán bỏ qua
  const skip = (Number(page) - 1) * Number(limit);

  // Thực hiện truy vấn
  const products = await Product.find(query).sort(sort).skip(skip).limit(Number(limit)).populate('category', 'name slug');

  // Đếm tổng số sản phẩm phù hợp với điều kiện
  const total = await Product.countDocuments(query);

  return {
    products,
    page: Number(page),
    limit: Number(limit),
    totalPages: Math.ceil(total / Number(limit)),
    totalItems: total,
  };
};

/**
 * Lấy tất cả sản phẩm với phân trang
 * @param {number} page - Số trang
 * @param {number} limit - Số lượng mỗi trang
 * @returns {Promise<Object>} Danh sách sản phẩm và thông tin phân trang
 */
const getAllProducts = async (page = 1, limit = 12) => {
  page = parseInt(page);
  limit = parseInt(limit);

  if (page < 1) page = 1;

  const products = await Product.find({ isActive: true })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('category', 'name slug');

  const total = await Product.countDocuments({ isActive: true });

  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    data: products,
  };
};

/**
 * Lấy sản phẩm theo danh mục
 * @param {ObjectId} categoryId - ID danh mục
 * @param {number} page - Số trang
 * @param {number} limit - Số lượng mỗi trang
 * @returns {Promise<Object>} Danh sách sản phẩm và thông tin phân trang
 */
const getProductsByCategory = async (categoryId, page = 1, limit = 12) => {
  page = parseInt(page);
  limit = parseInt(limit);

  if (page < 1) page = 1;

  const products = await Product.find({
    category: categoryId,
    isActive: true,
    stock: { $gt: 0 },
  })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('category', 'name slug');

  const total = await Product.countDocuments({
    category: categoryId,
    isActive: true,
    stock: { $gt: 0 },
  });

  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    data: products,
  };
};

/**
 * Lấy sản phẩm theo slug
 * @param {string} slug - Slug của sản phẩm
 * @returns {Promise<Product>} Thông tin sản phẩm
 */
const getProductBySlug = async (slug) => {
  return Product.findOne({ slug }).populate('category', 'name slug');
};

/**
 * Lấy sản phẩm liên quan
 * @param {ObjectId} productId - ID sản phẩm
 * @param {number} limit - Số lượng sản phẩm liên quan
 * @returns {Promise<Product[]>} Danh sách sản phẩm liên quan
 */
const getRelatedProducts = async (productId, limit = 4) => {
  const product = await getProductById(productId);

  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Không tìm thấy sản phẩm');
  }

  // Lấy sản phẩm cùng danh mục, loại trừ sản phẩm hiện tại
  const relatedProducts = await Product.find({
    category: product.category,
    _id: { $ne: productId },
    isActive: true,
    stock: { $gt: 0 },
  })
    .sort({ soldCount: -1, rating: -1 })
    .limit(limit)
    .select('name price images slug hasDiscount discountPrice');

  return relatedProducts;
};

/**
 * Lấy sản phẩm nổi bật
 * @param {number} limit - Số lượng sản phẩm
 * @returns {Promise<Product[]>} Danh sách sản phẩm nổi bật
 */
const getFeaturedProducts = async (limit = 8) => {
  return Product.find({
    isFeatured: true,
    isActive: true,
    stock: { $gt: 0 },
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('name price images slug hasDiscount discountPrice rating')
    .populate('category', 'name slug');
};

/**
 * Lấy sản phẩm mới
 * @param {number} limit - Số lượng sản phẩm
 * @returns {Promise<Product[]>} Danh sách sản phẩm mới
 */
const getNewArrivals = async (limit = 8) => {
  return Product.find({
    isActive: true,
    stock: { $gt: 0 },
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('name price images slug hasDiscount discountPrice')
    .populate('category', 'name slug');
};

/**
 * Lấy sản phẩm bán chạy nhất
 * @param {number} limit - Số lượng sản phẩm
 * @returns {Promise<Product[]>} Danh sách sản phẩm bán chạy
 */
const getBestSellingProducts = async (limit = 8) => {
  return Product.find({
    isActive: true,
    stock: { $gt: 0 },
  })
    .sort({ soldCount: -1 })
    .limit(limit)
    .select('name price images slug hasDiscount discountPrice soldCount')
    .populate('category', 'name slug');
};

/**
 * Lấy sản phẩm theo ID
 * @param {ObjectId} id - ID sản phẩm
 * @returns {Promise<Product>} Thông tin sản phẩm
 */
const getProductById = async (id) => {
  return Product.findById(id).populate('category', 'name slug');
};

/**
 * Cập nhật sản phẩm theo ID
 * @param {ObjectId} productId - ID sản phẩm
 * @param {Object} updateBody - Thông tin cập nhật
 * @returns {Promise<Product>} Sản phẩm đã cập nhật
 */
const updateProductById = async (productId, updateBody) => {
  const product = await getProductById(productId);
  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Không tìm thấy sản phẩm');
  }

  Object.assign(product, updateBody);
  await product.save();
  return product;
};

/**
 * Xóa sản phẩm theo ID
 * @param {ObjectId} productId - ID sản phẩm
 * @returns {Promise<Product>} Sản phẩm đã xóa
 */
const deleteProductById = async (productId) => {
  const product = await getProductById(productId);
  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Không tìm thấy sản phẩm');
  }

  // Thay vì xóa vĩnh viễn, có thể đánh dấu sản phẩm là không hoạt động
  // product.isActive = false;
  // await product.save();

  // Hoặc xóa vĩnh viễn nếu cần
  await product.deleteOne();
  return product;
};

/**
 * Lấy thống kê về sản phẩm
 * @returns {Promise<Object>} Thống kê sản phẩm
 */
const getProductStats = async () => {
  const totalProducts = await Product.countDocuments();
  const activeProducts = await Product.countDocuments({ isActive: true });
  const outOfStockProducts = await Product.countDocuments({ stock: 0 });
  const lowStockProducts = await Product.countDocuments({
    stock: { $gt: 0, $lte: '$lowStockThreshold' },
  });
  const featuredProducts = await Product.countDocuments({ isFeatured: true });
  const discountedProducts = await Product.countDocuments({ hasDiscount: true });

  // Đếm sản phẩm theo danh mục
  const productsByCategory = await Product.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 5 },
  ]);

  // Lấy thông tin danh mục cho kết quả
  const populatedProductsByCategory = await Product.populate(productsByCategory, { path: '_id', select: 'name slug' });

  return {
    total: totalProducts,
    active: activeProducts,
    outOfStock: outOfStockProducts,
    lowStock: lowStockProducts,
    featured: featuredProducts,
    discounted: discountedProducts,
    byCategory: populatedProductsByCategory,
  };
};

module.exports = {
  createProduct,
  searchProducts,
  getAllProducts,
  getProductById,
  getProductBySlug,
  getProductsByCategory,
  getRelatedProducts,
  getFeaturedProducts,
  getNewArrivals,
  getBestSellingProducts,
  updateProductById,
  deleteProductById,
  getProductStats,
};
