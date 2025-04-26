import apiClient from './api.service';

// Get all user orders
export const getUserOrders = async () => {
  return await apiClient.get('/orders');
};

// Get specific order details
export const getOrderDetails = async (orderId) => {
  return await apiClient.get(`/orders/${orderId}`);
};

// Create new order
export const createOrder = async (orderData) => {
  return await apiClient.post('/orders', orderData);
};

// Cancel order
export const cancelOrder = async (orderId) => {
  return await apiClient.put(`/orders/${orderId}/cancel`);
}; 