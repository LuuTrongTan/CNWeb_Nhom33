import axios from "axios";

const API_URL = "http://localhost:4000/v1";

export const getAllCategory = async () => {
  try {
    const response = await axios.get(`${API_URL}/category/getAllCategory`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy sản phẩm:", error);
    throw error;
  }
};

// Hàm lấy thông tin chi tiết sản phẩm
export const getProductById = async (productId) => {
  try {
    const response = await axios.get(`${API_URL}/product/${productId}`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết sản phẩm:", error);
    throw error;
  }
};

export const getProductFilter = async (color, category, size, page) => {
  try {
    const response = await axios.get(`${API_URL}/product/getFilterProducts`, {
      params: {
        color: color,
        category: category,
        size: size ? size.join(",") : "",
        page: page ? page : "1",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy sản phẩm có bộ lọc:", error);
    throw error;
  }
};
