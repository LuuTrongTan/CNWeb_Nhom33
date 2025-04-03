const axios = require("axios");

// Tạo mã vận đơn từ đơn vị vận chuyển
exports.createTrackingOrder = async (order) => {
  try {
    // Chọn đơn vị vận chuyển dựa trên địa chỉ hoặc cấu hình
    const provider = selectShippingProvider(order.shippingAddress);

    let trackingInfo;

    switch (provider) {
      case "GHTK":
        trackingInfo = await createGHTKOrder(order);
        break;
      case "GHN":
        trackingInfo = await createGHNOrder(order);
        break;
      case "ViettelPost":
        trackingInfo = await createViettelPostOrder(order);
        break;
      default:
        throw new Error("Unsupported shipping provider");
    }

    return {
      provider,
      trackingNumber: trackingInfo.trackingNumber,
    };
  } catch (error) {
    console.error("Error creating tracking order:", error);
    throw error;
  }
};

// Chọn đơn vị vận chuyển
const selectShippingProvider = (shippingAddress) => {
  // Logic chọn đơn vị vận chuyển dựa trên địa chỉ
  // Có thể dựa vào khu vực, giá dịch vụ, thời gian giao hàng, etc.
  return "GHTK"; // Mặc định sử dụng GHTK
};

// Tạo đơn hàng GHTK
const createGHTKOrder = async (order) => {
  const response = await axios.post(
    "https://services.giaohangtietkiem.vn/services/shipment/order",
    {
      products: order.items.map((item) => ({
        name: item.product.name,
        weight: 0.5,
        quantity: item.quantity,
        price: item.price,
      })),
      order: {
        id: order._id,
        pick_name: process.env.STORE_NAME,
        pick_address: process.env.STORE_ADDRESS,
        pick_province: process.env.STORE_PROVINCE,
        pick_district: process.env.STORE_DISTRICT,
        pick_ward: process.env.STORE_WARD,
        pick_tel: process.env.STORE_PHONE,
        tel: order.shippingAddress.phone,
        name: order.shippingAddress.fullName,
        address: order.shippingAddress.address,
        province: order.shippingAddress.city,
        district: order.shippingAddress.district,
        ward: order.shippingAddress.ward,
        hamlet: "Khác",
        is_freeship: 0,
        payment_date: new Date().toISOString(),
        note: order.notes || "",
      },
    },
    {
      headers: {
        Token: process.env.GHTK_TOKEN,
      },
    }
  );

  return {
    trackingNumber: response.data.order_info.order_id,
  };
};

// Tạo đơn hàng GHN
const createGHNOrder = async (order) => {
  // Implement GHN API integration
  throw new Error("GHN integration not implemented");
};

// Tạo đơn hàng ViettelPost
const createViettelPostOrder = async (order) => {
  // Implement ViettelPost API integration
  throw new Error("ViettelPost integration not implemented");
};
