const httpStatus = require('http-status');
const { User, Order } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a user
 * @param {Object} userBody
 * @returns {Promise<User>}
 */
const createUser = async (userBody) => {
  if (await User.isEmailTaken(userBody.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  return User.create(userBody);
};

/**
 * Query for users
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryUsers = async (filter, options) => {
  const users = await User.paginate(filter, options);
  return users;
};

/**
 * Get user by id
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const getUserById = async (id) => {
  return User.findById(id);
};

/**
 * Get user by email
 * @param {string} email
 * @returns {Promise<User>}
 */
const getUserByEmail = async (email) => {
  return User.findOne({ email });
};

/**
 * Update user by id
 * @param {ObjectId} userId
 * @param {Object} updateBody
 * @returns {Promise<User>}
 */
const updateUserById = async (userId, updateBody) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  if (updateBody.email && (await User.isEmailTaken(updateBody.email, userId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  Object.assign(user, updateBody);
  await user.save();
  return user;
};

/**
 * Delete user by id
 * @param {ObjectId} userId
 * @returns {Promise<User>}
 */
const deleteUserById = async (userId) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  await user.remove();
  return user;
};

/**
 * Lấy thông tin giao hàng của người dùng
 * @param {ObjectId} userId
 * @returns {Promise<Object>}
 */
const getUserShippingInfo = async (userId) => {
  const user = await getUserById(userId);
  
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Người dùng không tồn tại');
  }
  
  // Lấy đơn hàng gần nhất của người dùng để lấy thông tin giao hàng
  const latestOrder = await Order.findOne({ user: userId })
    .sort({ createdAt: -1 })
    .select('shippingAddress');
  
  // Nếu có đơn hàng trước đó, sử dụng thông tin giao hàng từ đơn hàng đó
  if (latestOrder && latestOrder.shippingAddress) {
    return {
      fullName: latestOrder.shippingAddress.fullName || user.name || '',
      phone: latestOrder.shippingAddress.phone || user.phone || '',
      address: latestOrder.shippingAddress.address || user.address || '',
      city: latestOrder.shippingAddress.city || '',
      district: latestOrder.shippingAddress.district || '',
      ward: latestOrder.shippingAddress.ward || '',
    };
  }
  
  // Nếu không có đơn hàng trước đó, sử dụng thông tin từ hồ sơ người dùng
  return {
    fullName: user.name || '',
    phone: user.phone || '',
    address: user.address || '',
    city: '',
    district: '',
    ward: '',
  };
};

module.exports = {
  createUser,
  queryUsers,
  getUserById,
  getUserByEmail,
  updateUserById,
  deleteUserById,
  getUserShippingInfo,
};