const axios = require("axios");

// Tính phí vận chuyển dựa trên địa chỉ
exports.calculateShippingFee = async (shippingAddress) => {
  try {
    // Tích hợp với API của các đơn vị vận chuyển
    // Ví dụ với GHTK
    const response = await axios.post(
      "https://services.giaohangtietkiem.vn/services/shipment/fee",
      {
        province: shippingAddress.city,
        district: shippingAddress.district,
        ward: shippingAddress.ward,
        address: shippingAddress.address,
        weight: 500, // Cân nặng mặc định 500g
        value: 1000000, // Giá trị đơn hàng
      },
      {
        headers: {
          Token: process.env.GHTK_TOKEN,
        },
      }
    );

    return response.data.fee.fee;
  } catch (error) {
    console.error("Error calculating shipping fee:", error);
    // Trả về phí mặc định nếu có lỗi
    return 30000;
  }
};
