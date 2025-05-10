import apiClient from "./api.service";

// Add new address
export const addAddress = async (addressData) => {
  return await apiClient.post("/users/addresses", addressData);
};

// Update address
export const updateAddress = async (addressId, addressData) => {
  return await apiClient.put(`/users/addresses/${addressId}`, addressData);
};

// Delete address
export const deleteAddress = async (addressId) => {
  return await apiClient.delete(`/users/addresses/${addressId}`);
};
