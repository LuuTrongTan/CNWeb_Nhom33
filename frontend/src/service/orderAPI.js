import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

// Lấy danh sách đơn hàng của người dùng đăng nhập
export const getUserOrders = async (page = 1, limit = 10) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Bạn cần đăng nhập để xem lịch sử đơn hàng");
    }

    const response = await axios.get(`${API_URL}/orders`, {
      params: { page, limit },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách đơn hàng:", error);
    throw error;
  }
};

// Lấy thông tin chi tiết đơn hàng
export const getOrderById = async (orderId) => {
  try {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      throw new Error("Bạn cần đăng nhập để xem chi tiết đơn hàng");
    }

    const response = await axios.get(`${API_URL}/orders/${orderId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết đơn hàng:", error);
    throw error;
  }
};

// Hủy đơn hàng
export const cancelOrder = async (orderId) => {
  try {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      throw new Error("Bạn cần đăng nhập để hủy đơn hàng");
    }

    const response = await axios.patch(
      `${API_URL}/orders/${orderId}/cancel`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Lỗi khi hủy đơn hàng:", error);
    throw error;
  }
};

// Lấy thống kê đơn hàng
export const getOrderStats = async () => {
  try {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      throw new Error("Bạn cần đăng nhập để xem thống kê đơn hàng");
    }

    const response = await axios.get(`${API_URL}/orders/stats`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy thống kê đơn hàng:", error);
    throw error;
  }
};
