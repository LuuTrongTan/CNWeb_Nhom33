import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export const getDistance = async (address) => {
  try {
    const response = await axios.post(`${API_URL}/goong/getDistance`, {
      address1: "Bách Khoa, Hai Bà Trưng, Hà Nội, Việt Nam",
      address2: address,
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết:", error);
    throw error;
  }
};
