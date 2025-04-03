import axios from "axios";

const API_URL = "http://localhost:4000/v1";

// Hàm gọi API lấy danh sách sản phẩm có phân trang
export const fetchProducts = async (page = 1, limit = 12) => {
  try {
    const response = await axios.get(`${API_URL}/product/getAllProduct`, {
      params: { page, limit },
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy sản phẩm:", error);
    throw error;
  }
};

// Hàm lấy thông tin chi tiết sản phẩm
export const getProductById = async (productId) => {
  try {
    const response = await axios.get(
      `${API_URL}/product?productId=${productId}`
    );
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

export const createProduct = async (productData) => {
  try {
    const response = await axios.post(`${API_URL}/product`, productData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi tạo sản phẩm:", error);
    throw error;
  }
};

export const deleteProduct = async (productId) => {
  try {
    const response = await axios.delete(
      `${API_URL}/product?productId=${productId}`
    );
    return response.data;
  } catch (error) {
    console.error("Lỗi khi xóa sản phẩm:", error);
    throw error;
  }
};

export const updateProduct = async (id, bodyData) => {
  try {
    const response = await axios.patch(
      `${API_URL}/product?productId=${id}`,
      bodyData
    );
    return response.data;
  } catch (error) {
    console.error("Lỗi khi cập nhật sản phẩm:", error);
    throw error;
  }
};
