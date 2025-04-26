import axios from "axios";

const API_URL = "http://localhost:4000";

// Hàm gọi API lấy danh sách sản phẩm có phân trang
export const fetchProductsAPI = async (page = 1, limit = 12) => {
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
    const response = await axios.get(`${API_URL}/product`, {
      params: { productId },
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết sản phẩm:", error);
    throw error;
  }
};

// Hàm lấy sản phẩm theo danh mục
export const getProductsByCategory = async (
  categoryId,
  page = 1,
  limit = 12
) => {
  try {
    const response = await axios.get(`${API_URL}/product/getByCategory`, {
      params: { categoryId, page, limit },
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy sản phẩm theo danh mục:", error);
    throw error;
  }
};

// Hàm lấy sản phẩm liên quan
export const getRelatedProducts = async (productId, limit = 4) => {
  try {
    const response = await axios.get(`${API_URL}/product/getRelated`, {
      params: { productId, limit },
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy sản phẩm liên quan:", error);
    throw error;
  }
};

export const getProductFilter = async (
  color,
  categoryId,
  size,
  minPrice,
  maxPrice,
  page,
  searchTerm
) => {
  try {
    const response = await axios.post(`${API_URL}/product/searchProducts`, {
      colors: color ?? "",
      category: categoryId ?? null,
      sizes: Array.isArray(size) ? size : size ? [size] : [],
      minPrice: minPrice !== undefined ? minPrice : 0,
      maxPrice: maxPrice !== undefined ? maxPrice : 10000000,
      page: Math.max(1, page ?? 1),
      searchTerm: searchTerm ?? "",
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
    const response = await axios.delete(`${API_URL}/product`, {
      params: { productId },
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi xóa sản phẩm:", error);
    throw error;
  }
};

export const updateProduct = async (id, bodyData) => {
  try {
    const response = await axios.patch(`${API_URL}/product`, bodyData, {
      params: { productId: id },
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi cập nhật sản phẩm:", error);
    throw error;
  }
};
