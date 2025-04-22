import apiClient from './api.service';

/**
 * Get the current user's wishlist
 * @returns {Promise} Promise object that resolves to the wishlist data
 */
export const getWishlist = async () => {
  try {
    const response = await apiClient.get('/wishlist');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error fetching wishlist' };
  }
};

/**
 * Add a product to the wishlist
 * @param {string} productId - The ID of the product to add
 * @returns {Promise} Promise object that resolves to the updated wishlist
 */
export const addToWishlist = async (productId) => {
  try {
    const response = await apiClient.post('/wishlist', { productId });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error adding product to wishlist' };
  }
};

/**
 * Remove a product from the wishlist
 * @param {string} productId - The ID of the product to remove
 * @returns {Promise} Promise object that resolves to the updated wishlist
 */
export const removeFromWishlist = async (productId) => {
  try {
    const response = await apiClient.delete(`/wishlist/${productId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error removing product from wishlist' };
  }
};

/**
 * Clear the entire wishlist
 * @returns {Promise} Promise object that resolves to the empty wishlist
 */
export const clearWishlist = async () => {
  try {
    const response = await apiClient.delete('/wishlist');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error clearing wishlist' };
  }
};

/**
 * Check if a product is in the wishlist
 * @param {string} productId - The ID of the product to check
 * @returns {Promise} Promise object that resolves to a boolean indicating if the product is in the wishlist
 */
export const isInWishlist = async (productId) => {
  try {
    const response = await apiClient.get(`/wishlist/check/${productId}`);
    return response.data.isInWishlist;
  } catch (error) {
    throw error.response?.data || { message: 'Error checking wishlist status' };
  }
}; 