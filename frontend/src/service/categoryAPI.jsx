import axios from "axios";

const API_URL = "http://localhost:4000";

export const getAllCategory = async () => {
  try {
    const response = await axios.get(`${API_URL}/category/getAllCategory`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy danh mục:", error);
    throw error;
  }
};

// Hàm lấy thông tin chi tiết sản phẩm
export const getCategoryById = async (categoryId) => {
  try {
    const response = await axios.get(`${API_URL}/category`, {
      params: { categoryId },
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết danh mục:", error);
    throw error;
  }
};

export const createCategory = async (categoryData) => {
  try {
    const response = await axios.post(`${API_URL}/category`, categoryData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi tạo danh mục:", error);
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
