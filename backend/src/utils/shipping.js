// Tính phí vận chuyển dựa trên địa chỉ
exports.calculateShippingFee = async (shippingAddress) => {
  try {
    const { city, shippingMethod } = shippingAddress;
    
    // Phí ship cơ bản dựa trên thành phố
    let baseFee = 0;
    
    // Nhóm 1: Nội thành các thành phố lớn
    const group1 = ["Hà Nội", "Hồ Chí Minh"];
    
    // Nhóm 2: Các thành phố cấp 1
    const group2 = ["Đà Nẵng", "Hải Phòng", "Cần Thơ"];
    
    // Nhóm 3: Các tỉnh miền Bắc và miền Trung
    const group3 = [
      "Bắc Giang", "Bắc Kạn", "Bắc Ninh", "Cao Bằng", "Điện Biên",
      "Hà Giang", "Hà Nam", "Hà Tĩnh", "Hải Dương", "Hòa Bình",
      "Hưng Yên", "Lai Châu", "Lạng Sơn", "Lào Cai", "Nam Định",
      "Nghệ An", "Ninh Bình", "Phú Thọ", "Quảng Bình", "Quảng Ninh",
      "Quảng Trị", "Sơn La", "Thái Bình", "Thái Nguyên", "Thanh Hóa",
      "Thừa Thiên Huế", "Tuyên Quang", "Vĩnh Phúc", "Yên Bái"
    ];
    
    // Nhóm 4: Các tỉnh miền Nam và Tây Nguyên
    const group4 = [
      "An Giang", "Bà Rịa - Vũng Tàu", "Bạc Liêu", "Bến Tre", "Bình Định",
      "Bình Dương", "Bình Phước", "Bình Thuận", "Cà Mau", "Đắk Lắk",
      "Đắk Nông", "Đồng Nai", "Đồng Tháp", "Gia Lai", "Hậu Giang",
      "Khánh Hòa", "Kiên Giang", "Kon Tum", "Lâm Đồng", "Long An",
      "Ninh Thuận", "Phú Yên", "Quảng Nam", "Quảng Ngãi", "Sóc Trăng",
      "Tây Ninh", "Tiền Giang", "Trà Vinh", "Vĩnh Long"
    ];
    
    if (group1.includes(city)) {
      baseFee = 30000;
    } else if (group2.includes(city)) {
      baseFee = 40000;
    } else if (group3.includes(city)) {
      baseFee = 50000;
    } else if (group4.includes(city)) {
      baseFee = 60000;
    } else {
      baseFee = 70000; // Phí mặc định cho các khu vực khác
    }

    // Phương thức vận chuyển không ảnh hưởng đến phí cơ bản
    // Phí của phương thức vận chuyển sẽ được tính ở phía frontend
    
    return baseFee;
  } catch (error) {
    console.error("Error calculating shipping fee:", error);
    return 30000; // Phí mặc định
  }
};
