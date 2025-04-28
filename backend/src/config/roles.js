const allRoles = {
  user: ['getProfile', 'updateProfile', 'updatePassword', 'manageAddresses', 'manageWishlist', 'viewOrders'],
  admin: ['getUsers', 'manageUsers', 'manageProducts', 'manageOrders', 'manageCategories', 'viewAnalytics'],
};

const roles = Object.keys(allRoles);
const roleRights = new Map(Object.entries(allRoles));

module.exports = {
  roles,
  roleRights,
};
