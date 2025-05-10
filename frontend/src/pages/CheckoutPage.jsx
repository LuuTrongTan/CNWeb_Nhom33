import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faSpinner, faCheck, faShoppingBag, faMapMarkerAlt, faCreditCard, faNoteSticky, faChevronDown, faTruck } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import "../styles/css/CheckoutPage.css";

// Tạo instance axios
const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || ''}/api`,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Interceptor để thêm token xác thực
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Dữ liệu mô phỏng cho các tỉnh/thành phố, quận/huyện, phường/xã
const CITIES = [
  "Hà Nội", "Hồ Chí Minh", "Đà Nẵng", "Hải Phòng", "Cần Thơ",
  "An Giang", "Bà Rịa - Vũng Tàu", "Bắc Giang", "Bắc Kạn", "Bạc Liêu",
  "Bắc Ninh", "Bến Tre", "Bình Định", "Bình Dương", "Bình Phước",
  "Bình Thuận", "Cà Mau", "Cao Bằng", "Đắk Lắk", "Đắk Nông",
  "Điện Biên", "Đồng Nai", "Đồng Tháp", "Gia Lai", "Hà Giang",
  "Hà Nam", "Hà Tĩnh", "Hải Dương", "Hậu Giang", "Hòa Bình",
  "Hưng Yên", "Khánh Hòa", "Kiên Giang", "Kon Tum", "Lai Châu",
  "Lâm Đồng", "Lạng Sơn", "Lào Cai", "Long An", "Nam Định",
  "Nghệ An", "Ninh Bình", "Ninh Thuận", "Phú Thọ", "Phú Yên",
  "Quảng Bình", "Quảng Nam", "Quảng Ngãi", "Quảng Ninh", "Quảng Trị",
  "Sóc Trăng", "Sơn La", "Tây Ninh", "Thái Bình", "Thái Nguyên",
  "Thanh Hóa", "Thừa Thiên Huế", "Tiền Giang", "Trà Vinh", "Tuyên Quang",
  "Vĩnh Long", "Vĩnh Phúc", "Yên Bái"
];

// Mô phỏng dữ liệu quận/huyện
const DISTRICTS = {
  "Hà Nội": [
    "Ba Đình", "Hoàn Kiếm", "Hai Bà Trưng", "Đống Đa", "Tây Hồ", 
    "Cầu Giấy", "Thanh Xuân", "Hoàng Mai", "Long Biên", "Nam Từ Liêm", 
    "Bắc Từ Liêm", "Hà Đông", "Sơn Tây", "Ba Vì", "Chương Mỹ",
    "Đan Phượng", "Đông Anh", "Gia Lâm", "Hoài Đức", "Mê Linh",
    "Mỹ Đức", "Phú Xuyên", "Phúc Thọ", "Quốc Oai", "Sóc Sơn",
    "Thạch Thất", "Thanh Oai", "Thường Tín", "Ứng Hòa"
  ],
  "Hồ Chí Minh": [
    "Quận 1", "Quận 2", "Quận 3", "Quận 4", "Quận 5", "Quận 6", 
    "Quận 7", "Quận 8", "Quận 9", "Quận 10", "Quận 11", "Quận 12", 
    "Bình Tân", "Bình Thạnh", "Gò Vấp", "Phú Nhuận", "Tân Bình", 
    "Tân Phú", "Thủ Đức", "Bình Chánh", "Cần Giờ", "Củ Chi", 
    "Hóc Môn", "Nhà Bè"
  ],
  "Đà Nẵng": [
    "Hải Châu", "Thanh Khê", "Sơn Trà", "Ngũ Hành Sơn", "Liên Chiểu", 
    "Cẩm Lệ", "Hòa Vang", "Hoàng Sa"
  ],
  "Hải Phòng": [
    "Hồng Bàng", "Ngô Quyền", "Lê Chân", "Hải An", "Kiến An", 
    "Đồ Sơn", "Dương Kinh", "An Dương", "An Lão", "Bạch Long Vĩ", 
    "Cát Hải", "Kiến Thụy", "Thủy Nguyên", "Tiên Lãng", "Vĩnh Bảo"
  ],
  "Cần Thơ": [
    "Ninh Kiều", "Bình Thủy", "Cái Răng", "Ô Môn", "Thốt Nốt", 
    "Cờ Đỏ", "Phong Điền", "Thới Lai", "Vĩnh Thạnh"
  ],
  "An Giang": [
    "Long Xuyên", "Châu Đốc", "An Phú", "Châu Phú", "Châu Thành", 
    "Chợ Mới", "Phú Tân", "Tân Châu", "Thoại Sơn", "Tịnh Biên", "Tri Tôn"
  ],
  "Bà Rịa - Vũng Tàu": [
    "Vũng Tàu", "Bà Rịa", "Châu Đức", "Côn Đảo", "Đất Đỏ", 
    "Long Điền", "Tân Thành", "Xuyên Mộc"
  ],
  "Bắc Giang": [
    "Bắc Giang", "Hiệp Hòa", "Lạng Giang", "Lục Nam", "Lục Ngạn", 
    "Sơn Động", "Tân Yên", "Việt Yên", "Yên Dũng", "Yên Thế"
  ],
  "Khánh Hòa": [
    "Nha Trang", "Cam Ranh", "Ninh Hòa", "Cam Lâm", "Khánh Sơn", 
    "Khánh Vĩnh", "Trường Sa", "Vạn Ninh"
  ],
  "Lâm Đồng": [
    "Đà Lạt", "Bảo Lộc", "Bảo Lâm", "Cát Tiên", "Đạ Huoai", 
    "Đạ Tẻh", "Đam Rông", "Di Linh", "Đơn Dương", "Đức Trọng", 
    "Lạc Dương", "Lâm Hà"
  ]
};

// Mô phỏng dữ liệu phường/xã
const WARDS = {
  // Hà Nội
  "Ba Đình": ["Phúc Xá", "Trúc Bạch", "Vĩnh Phúc", "Cống Vị", "Liễu Giai", "Nguyễn Trung Trực", "Quán Thánh", "Thành Công"],
  "Hoàn Kiếm": ["Hàng Trống", "Hàng Bài", "Tràng Tiền", "Hàng Bông", "Cửa Nam", "Đồng Xuân", "Hàng Bạc", "Hàng Bồ", "Hàng Đào", "Hàng Gai"],
  "Hai Bà Trưng": ["Bạch Đằng", "Bách Khoa", "Bạch Mai", "Bùi Thị Xuân", "Cầu Dền", "Đống Mác", "Đồng Nhân", "Đồng Tâm", "Lê Đại Hành", "Minh Khai"],
  "Đống Đa": ["Cát Linh", "Hàng Bột", "Khâm Thiên", "Khương Thượng", "Kim Liên", "Láng Hạ", "Láng Thượng", "Nam Đồng", "Ngã Tư Sở", "Ô Chợ Dừa"],
  "Tây Hồ": ["Bưởi", "Thụy Khuê", "Yên Phụ", "Tứ Liên", "Quảng An", "Nhật Tân", "Xuân La", "Phú Thượng"],
  "Cầu Giấy": ["Dịch Vọng", "Dịch Vọng Hậu", "Mai Dịch", "Nghĩa Đô", "Nghĩa Tân", "Quan Hoa", "Trung Hòa", "Yên Hòa"],
  "Thanh Xuân": ["Hạ Đình", "Khương Đình", "Khương Mai", "Khương Trung", "Kim Giang", "Nhân Chính", "Phương Liệt", "Thanh Xuân Bắc", "Thanh Xuân Nam", "Thanh Xuân Trung"],
  "Hoàng Mai": ["Đại Kim", "Định Công", "Giáp Bát", "Hoàng Liệt", "Hoàng Văn Thụ", "Lĩnh Nam", "Mai Động", "Tân Mai", "Thanh Trì", "Thịnh Liệt", "Trần Phú", "Tương Mai", "Vĩnh Hưng", "Yên Sở"],
  "Long Biên": ["Bồ Đề", "Cự Khối", "Đức Giang", "Gia Thụy", "Giang Biên", "Long Biên", "Ngọc Lâm", "Ngọc Thụy", "Phúc Đồng", "Phúc Lợi", "Sài Đồng", "Thạch Bàn", "Thượng Thanh", "Việt Hưng"],
  "Nam Từ Liêm": ["Cầu Diễn", "Đại Mỗ", "Mễ Trì", "Mỹ Đình 1", "Mỹ Đình 2", "Phú Đô", "Phương Canh", "Tây Mỗ", "Trung Văn", "Xuân Phương"],
  "Bắc Từ Liêm": ["Cổ Nhuế 1", "Cổ Nhuế 2", "Đông Ngạc", "Đức Thắng", "Liên Mạc", "Minh Khai", "Phú Diễn", "Phúc Diễn", "Tây Tựu", "Thụy Phương", "Thượng Cát", "Xuân Đỉnh", "Xuân Tảo"],
  
  // Hồ Chí Minh
  "Quận 1": ["Bến Nghé", "Bến Thành", "Cầu Kho", "Cầu Ông Lãnh", "Đa Kao", "Nguyễn Cư Trinh", "Nguyễn Thái Bình", "Phạm Ngũ Lão", "Tân Định"],
  "Quận 2": ["An Khánh", "An Lợi Đông", "An Phú", "Bình An", "Bình Khánh", "Bình Trưng Đông", "Bình Trưng Tây", "Cát Lái", "Thạnh Mỹ Lợi", "Thảo Điền"],
  "Quận 3": ["Phường 1", "Phường 2", "Phường 3", "Phường 4", "Phường 5", "Phường 6", "Phường 7", "Phường 8", "Phường 9", "Phường 10", "Phường 11", "Phường 12", "Phường 13", "Phường 14"],
  "Quận 4": ["Phường 1", "Phường 2", "Phường 3", "Phường 4", "Phường 5", "Phường 6", "Phường 8", "Phường 9", "Phường 10", "Phường 13", "Phường 14", "Phường 15", "Phường 16", "Phường 18"],
  "Quận 5": ["Phường 1", "Phường 2", "Phường 3", "Phường 4", "Phường 5", "Phường 6", "Phường 7", "Phường 8", "Phường 9", "Phường 10", "Phường 11", "Phường 12", "Phường 13", "Phường 14"],
  "Quận 6": ["Phường 1", "Phường 2", "Phường 3", "Phường 4", "Phường 5", "Phường 6", "Phường 7", "Phường 8", "Phường 9", "Phường 10", "Phường 11", "Phường 12", "Phường 13", "Phường 14"],
  "Quận 7": ["Bình Thuận", "Phú Mỹ", "Phú Thuận", "Tân Hưng", "Tân Kiểng", "Tân Phong", "Tân Phú", "Tân Quy", "Tân Thuận Đông", "Tân Thuận Tây"],
  "Quận 8": ["Phường 1", "Phường 2", "Phường 3", "Phường 4", "Phường 5", "Phường 6", "Phường 7", "Phường 8", "Phường 9", "Phường 10", "Phường 11", "Phường 12", "Phường 13", "Phường 14", "Phường 15", "Phường 16"],
  
  // Đà Nẵng
  "Hải Châu": ["Hải Châu 1", "Hải Châu 2", "Nam Dương", "Phước Ninh", "Thạch Thang", "Thanh Bình", "Thuận Phước", "Bình Hiên", "Bình Thuận", "Hòa Cường Bắc", "Hòa Cường Nam", "Hòa Thuận Đông", "Hòa Thuận Tây"],
  "Thanh Khê": ["An Khê", "Chính Gián", "Hòa Khê", "Tam Thuận", "Tân Chính", "Thạc Gián", "Thanh Khê Đông", "Thanh Khê Tây", "Vĩnh Trung", "Xuân Hà"],
  "Sơn Trà": ["An Hải Bắc", "An Hải Đông", "An Hải Tây", "Mân Thái", "Nại Hiên Đông", "Phước Mỹ", "Thọ Quang"],
  "Ngũ Hành Sơn": ["Hòa Hải", "Hòa Quý", "Khuê Mỹ", "Mỹ An"],
  "Liên Chiểu": ["Hòa Hiệp Bắc", "Hòa Hiệp Nam", "Hòa Khánh Bắc", "Hòa Khánh Nam", "Hòa Minh"],
  
  // Hải Phòng
  "Hồng Bàng": ["Hoàng Văn Thụ", "Hùng Vương", "Minh Khai", "Phạm Hồng Thái", "Phan Bội Châu", "Quán Toan", "Quang Trung", "Sở Dầu", "Thượng Lý", "Trại Chuối"],
  "Ngô Quyền": ["Cầu Đất", "Cầu Tre", "Đằng Giang", "Đông Khê", "Đổng Quốc Bình", "Gia Viên", "Lạc Viên", "Lê Lợi", "Lương Khánh Thiện", "Máy Chai", "Máy Tơ", "Vạn Mỹ"],
  "Lê Chân": ["An Biên", "An Dương", "Cát Dài", "Đông Hải", "Dư Hàng", "Dư Hàng Kênh", "Hàng Kênh", "Hồ Nam", "Kênh Dương", "Lam Sơn", "Nghĩa Xá", "Niệm Nghĩa", "Trại Cau", "Vĩnh Niệm"],
  
  // Cần Thơ
  "Ninh Kiều": ["An Bình", "An Cư", "An Hòa", "An Khánh", "An Lạc", "An Nghiệp", "An Phú", "Cái Khế", "Hưng Lợi", "Tân An", "Thới Bình", "Xuân Khánh"],
  "Bình Thủy": ["An Thới", "Bình Thủy", "Bùi Hữu Nghĩa", "Long Hòa", "Long Tuyền", "Thới An Đông", "Trà An", "Trà Nóc"],
  
  // Khánh Hòa
  "Nha Trang": ["Lộc Thọ", "Phước Tân", "Phước Tiến", "Phước Hòa", "Phước Hải", "Phước Long", "Tân Lập", "Vạn Thắng", "Vĩnh Hải", "Vĩnh Phước", "Vĩnh Thọ", "Xương Huân"],
  
  // Lâm Đồng
  "Đà Lạt": ["Phường 1", "Phường 2", "Phường 3", "Phường 4", "Phường 5", "Phường 6", "Phường 7", "Phường 8", "Phường 9", "Phường 10", "Phường 11", "Phường 12"],
  
  // Thêm phường xã mặc định cho các quận/huyện khác
  "_default": ["Phường/Xã 1", "Phường/Xã 2", "Phường/Xã 3", "Phường/Xã 4", "Phường/Xã 5"]
};

const CheckoutPage = () => {
    const navigate = useNavigate();
  const { cart, calculateTotal, clearCart, getSelectedItems } = useCart();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingUserInfo, setLoadingUserInfo] = useState(false);
  const [shippingFee, setShippingFee] = useState(0);
  
  // State cho các dropdown
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const [districtDropdownOpen, setDistrictDropdownOpen] = useState(false);
  const [wardDropdownOpen, setWardDropdownOpen] = useState(false);
  
  // State cho tìm kiếm
  const [citySearch, setCitySearch] = useState("");
  const [districtSearch, setDistrictSearch] = useState("");
  const [wardSearch, setWardSearch] = useState("");
  
  // State cho danh sách quận/huyện và phường/xã dựa trên tỉnh/quận được chọn
  const [availableDistricts, setAvailableDistricts] = useState([]);
  const [availableWards, setAvailableWards] = useState([]);
  
  // Phương thức vận chuyển
  const [shippingMethods, setShippingMethods] = useState([
    { id: "standard", name: "Giao hàng tiêu chuẩn", description: "3-5 ngày", fee: 0 },
    { id: "fast", name: "Giao hàng nhanh", description: "1-2 ngày", fee: 20000 },
    { id: "express", name: "Giao hàng hỏa tốc", description: "Trong ngày", fee: 50000 }
  ]);
  
  const [orderInfo, setOrderInfo] = useState({
    fullName: "",
    address: "",
    city: "",
    district: "",
    ward: "",
    phone: "",
    paymentMethod: "cod",
    shippingMethod: "standard",
    notes: ""
  });
  
  // Kiểm tra xem có sản phẩm được chọn không
  useEffect(() => {
    const selectedItems = getSelectedItems();
    if (!selectedItems || selectedItems.length === 0) {
      alert("Vui lòng chọn sản phẩm để thanh toán!");
      navigate("/cart");
    }
  }, []);

  // Lấy thông tin người dùng đã đăng nhập
  useEffect(() => {
    const fetchUserShippingInfo = async () => {
      if (isAuthenticated) {
        try {
          setLoadingUserInfo(true);
          const response = await api.get('/users/shipping-info');
          
          const userInfo = {
            fullName: response.data.fullName || "",
            address: response.data.address || "",
            city: response.data.city || "",
            district: response.data.district || "",
            ward: response.data.ward || "",
            phone: response.data.phone || ""
          };
          
          setOrderInfo(prev => ({...prev, ...userInfo}));
          
          // Cập nhật danh sách quận/huyện nếu có tỉnh/thành phố
          if (response.data.city && DISTRICTS[response.data.city]) {
            setAvailableDistricts(DISTRICTS[response.data.city]);
          }
          
          // Cập nhật danh sách phường/xã nếu có quận/huyện
          if (response.data.district && WARDS[response.data.district]) {
            setAvailableWards(WARDS[response.data.district]);
          }

          // Tính phí ship nếu có đủ thông tin
          if (response.data.city && response.data.district && response.data.ward) {
            calculateShippingFee({
              ...userInfo,
              shippingMethod: orderInfo.shippingMethod
            });
          }
        } catch (error) {
          console.error("Lỗi khi lấy thông tin người dùng:", error);
        } finally {
          setLoadingUserInfo(false);
        }
      }
    };

    fetchUserShippingInfo();
  }, [isAuthenticated]);

  const calculateShippingFee = async (address) => {
    try {
      const response = await api.post('/shipping/calculate', {
        city: address.city,
        district: address.district,
        ward: address.ward,
        address: address.address,
        shippingMethod: address.shippingMethod
      });
      
      // Lấy phí ship cơ bản từ API
      let baseFee = response.data.fee;
      
      // Tìm phương thức vận chuyển đã chọn
      const selectedMethod = shippingMethods.find(method => method.id === address.shippingMethod);
      
      // Cộng thêm phí của phương thức vận chuyển
      const totalFee = baseFee + (selectedMethod ? selectedMethod.fee : 0);
      
      setShippingFee(totalFee);
    } catch (error) {
      console.error("Lỗi khi tính phí ship:", error);
      
      // Tính phí mặc định nếu có lỗi
      const selectedMethod = shippingMethods.find(method => method.id === address.shippingMethod);
      const defaultFee = 30000 + (selectedMethod ? selectedMethod.fee : 0);
      
      setShippingFee(defaultFee);
    }
  };

  // Xử lý khi chọn tỉnh/thành phố
  const handleCitySelect = (city) => {
    setOrderInfo(prev => ({...prev, city, district: "", ward: ""}));
    setAvailableDistricts(DISTRICTS[city] || []);
    setAvailableWards([]);
    setCityDropdownOpen(false);
    setCitySearch("");
  };
  
  // Xử lý khi chọn quận/huyện
  const handleDistrictSelect = (district) => {
    setOrderInfo(prev => ({...prev, district, ward: ""}));
    // Nếu có danh sách phường/xã cho quận/huyện này thì dùng, nếu không thì dùng danh sách mặc định
    setAvailableWards(WARDS[district] || WARDS["_default"]);
    setDistrictDropdownOpen(false);
    setDistrictSearch("");
  };
  
  // Xử lý khi chọn phường/xã
  const handleWardSelect = (ward) => {
    setOrderInfo(prev => ({...prev, ward}));
    setWardDropdownOpen(false);
    setWardSearch("");
  };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
    setOrderInfo(prev => ({ ...prev, [name]: value }));
    
    // Tính lại phí ship khi thay đổi địa chỉ
    if (["city", "district", "ward", "address"].includes(name)) {
      if (orderInfo.city && orderInfo.district && orderInfo.ward) {
        calculateShippingFee(orderInfo);
      }
    }
    };

  const validateForm = () => {
    const { fullName, address, city, district, ward, phone } = orderInfo;
    if (!fullName || !address || !city || !district || !ward || !phone) {
                alert("Vui lòng điền đầy đủ thông tin giao hàng!");
      return false;
    }

    // Validate phone number (10-11 digits)
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(phone)) {
      alert("Số điện thoại không hợp lệ (cần 10-11 chữ số)!");
      return false;
    }

    return true;
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      
      // Lấy danh sách sản phẩm đã chọn
      const selectedCartItems = getSelectedItems();
      
      if (selectedCartItems.length === 0) {
        alert("Vui lòng chọn ít nhất một sản phẩm để thanh toán!");
        navigate("/cart");
        return;
      }

      // Chuẩn bị dữ liệu đơn hàng
      const orderData = {
        items: selectedCartItems.map(item => ({
          product: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
          color: item.selectedColor,
          size: item.selectedSize
        })),
        shippingAddress: {
          fullName: orderInfo.fullName,
          address: orderInfo.address,
          city: orderInfo.city,
          district: orderInfo.district,
          ward: orderInfo.ward,
          phone: orderInfo.phone
        },
        paymentMethod: orderInfo.paymentMethod,
        shippingMethod: orderInfo.shippingMethod,
        totalItemsPrice: calculateTotal(),
        shippingPrice: shippingFee
      };

      // Gọi API tạo đơn hàng
      const response = await api.post("/orders", orderData);
      
      // Xử lý thành công
      clearCart(); // Xóa giỏ hàng
      
      // Chuyển hướng đến trang xác nhận đơn hàng
      navigate(`/order-confirmation/${response.data.id}`);
    } catch (error) {
      console.error("Lỗi khi đặt hàng:", error);
      alert("Có lỗi xảy ra khi đặt hàng: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  // Lọc danh sách dựa trên văn bản tìm kiếm
  const filteredCities = CITIES.filter(city => 
    city.toLowerCase().includes(citySearch.toLowerCase())
  );
  
  const filteredDistricts = availableDistricts.filter(district => 
    district.toLowerCase().includes(districtSearch.toLowerCase())
  );
  
  const filteredWards = availableWards.filter(ward => 
    ward.toLowerCase().includes(wardSearch.toLowerCase())
  );

  // Hàm xử lý khi người dùng nhấp vào dropdown nhưng không phải vào input
  const handleDropdownClick = (e, dropdownRef, setDropdownOpen) => {
    // Nếu click vào input thì không làm gì để tránh đóng dropdown khi đang tìm kiếm
    if (e.target.tagName.toLowerCase() === 'input') return;
    setDropdownOpen(prev => !prev);
  };

  const selectedItems = getSelectedItems();
  
        return (
    <div className="checkout-page-container">
      <div className="checkout-page-header">
        <h1 className="checkout-page-title">
          <FontAwesomeIcon icon={faShoppingBag} className="mr-2" />
          Thanh toán đơn hàng
        </h1>
        <button 
          className="back-to-cart-button"
          onClick={() => navigate("/cart")}
        >
          <FontAwesomeIcon icon={faArrowLeft} /> Quay lại giỏ hàng
                </button>
            </div>
      
      <div className="checkout-page-content">
        {loadingUserInfo ? (
          <div className="loading-container">
            <FontAwesomeIcon icon={faSpinner} spin size="2x" className="text-blue-500" />
            <p>Đang tải thông tin...</p>
          </div>
        ) : (
          <div className="checkout-page-layout">
            <div className="checkout-page-form-section">
              <form onSubmit={handleSubmitOrder}>
                {/* Phần thông tin giao hàng */}
                <div className="checkout-section">
                  <h2 className="checkout-section-title">
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="section-icon" />
                    Thông tin giao hàng
                  </h2>
                  <div className="checkout-section-content">
                    <div className="checkout-form-row">
                      <div className="checkout-form-group">
                        <label>Họ tên <span className="required">*</span></label>
                        <input 
                          type="text" 
                          name="fullName" 
                          value={orderInfo.fullName}
                          onChange={handleInputChange} 
                          required
                        />
                      </div>
                      <div className="checkout-form-group">
                        <label>Số điện thoại <span className="required">*</span></label>
                        <input 
                          type="tel" 
                          name="phone" 
                          value={orderInfo.phone}
                          onChange={handleInputChange} 
                          required
                        />
                      </div>
                    </div>
                    <div className="checkout-form-group">
                      <label>Địa chỉ <span className="required">*</span></label>
                      <input 
                        type="text" 
                        name="address" 
                        value={orderInfo.address}
                        onChange={handleInputChange}
                        required
                        placeholder="Số nhà, tên đường"
                      />
                    </div>
                    <div className="checkout-form-row">
                      <div className="checkout-form-group">
                        <label>Tỉnh/Thành phố <span className="required">*</span></label>
                        <div className="custom-dropdown">
                          <div 
                            className={`dropdown-selected ${cityDropdownOpen ? 'dropdown-active' : ''}`}
                            onClick={(e) => handleDropdownClick(e, null, setCityDropdownOpen)}
                          >
                            {cityDropdownOpen ? (
                              <input
                                type="text"
                                value={citySearch}
                                onChange={(e) => setCitySearch(e.target.value)}
                                placeholder="Tìm tỉnh/thành phố..."
                                onClick={(e) => e.stopPropagation()}
                                className="dropdown-search"
                                autoFocus
                              />
                            ) : (
                              <span className="dropdown-selected-text">{orderInfo.city || "Chọn tỉnh/thành phố"}</span>
                            )}
                            <FontAwesomeIcon icon={faChevronDown} className={`dropdown-icon ${cityDropdownOpen ? 'dropdown-icon-active' : ''}`} />
                          </div>
                          {cityDropdownOpen && (
                            <ul className="dropdown-options">
                              {filteredCities.length > 0 ? (
                                filteredCities.map(city => (
                                  <li 
                                    key={city} 
                                    onClick={() => handleCitySelect(city)}
                                    className={orderInfo.city === city ? "selected" : ""}
                                  >
                                    <span className="dropdown-option-text">{city}</span>
                                    {orderInfo.city === city && <FontAwesomeIcon icon={faCheck} className="check-icon" />}
                                  </li>
                                ))
                              ) : (
                                <li className="no-results">Không tìm thấy kết quả</li>
                              )}
                            </ul>
                          )}
                        </div>
                      </div>
                      <div className="checkout-form-group">
                        <label>Quận/Huyện <span className="required">*</span></label>
                        <div className="custom-dropdown">
                          <div 
                            className={`dropdown-selected ${!orderInfo.city ? "disabled" : ""} ${districtDropdownOpen ? 'dropdown-active' : ''}`}
                            onClick={(e) => orderInfo.city && handleDropdownClick(e, null, setDistrictDropdownOpen)}
                          >
                            {districtDropdownOpen ? (
                              <input
                                type="text"
                                value={districtSearch}
                                onChange={(e) => setDistrictSearch(e.target.value)}
                                placeholder="Tìm quận/huyện..."
                                onClick={(e) => e.stopPropagation()}
                                className="dropdown-search"
                                autoFocus
                              />
                            ) : (
                              <span className="dropdown-selected-text">{orderInfo.district || "Chọn quận/huyện"}</span>
                            )}
                            {orderInfo.city && <FontAwesomeIcon icon={faChevronDown} className={`dropdown-icon ${districtDropdownOpen ? 'dropdown-icon-active' : ''}`} />}
                          </div>
                          {districtDropdownOpen && availableDistricts.length > 0 && (
                            <ul className="dropdown-options">
                              {filteredDistricts.length > 0 ? (
                                filteredDistricts.map(district => (
                                  <li 
                                    key={district} 
                                    onClick={() => handleDistrictSelect(district)}
                                    className={orderInfo.district === district ? "selected" : ""}
                                  >
                                    <span className="dropdown-option-text">{district}</span>
                                    {orderInfo.district === district && <FontAwesomeIcon icon={faCheck} className="check-icon" />}
                                  </li>
                                ))
                              ) : (
                                <li className="no-results">Không tìm thấy kết quả</li>
                              )}
                            </ul>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="checkout-form-group">
                      <label>Phường/Xã <span className="required">*</span></label>
                      <div className="custom-dropdown">
                        <div 
                          className={`dropdown-selected ${!orderInfo.district ? "disabled" : ""} ${wardDropdownOpen ? 'dropdown-active' : ''}`}
                          onClick={(e) => orderInfo.district && handleDropdownClick(e, null, setWardDropdownOpen)}
                        >
                          {wardDropdownOpen ? (
                            <input
                              type="text"
                              value={wardSearch}
                              onChange={(e) => setWardSearch(e.target.value)}
                              placeholder="Tìm phường/xã..."
                              onClick={(e) => e.stopPropagation()}
                              className="dropdown-search"
                              autoFocus
                            />
                          ) : (
                            <span className="dropdown-selected-text">{orderInfo.ward || "Chọn phường/xã"}</span>
                          )}
                          {orderInfo.district && <FontAwesomeIcon icon={faChevronDown} className={`dropdown-icon ${wardDropdownOpen ? 'dropdown-icon-active' : ''}`} />}
                        </div>
                        {wardDropdownOpen && availableWards.length > 0 && (
                          <ul className="dropdown-options">
                            {filteredWards.length > 0 ? (
                              filteredWards.map(ward => (
                                <li 
                                  key={ward} 
                                  onClick={() => handleWardSelect(ward)}
                                  className={orderInfo.ward === ward ? "selected" : ""}
                                >
                                  <span className="dropdown-option-text">{ward}</span>
                                  {orderInfo.ward === ward && <FontAwesomeIcon icon={faCheck} className="check-icon" />}
                                </li>
                              ))
                            ) : (
                              <li className="no-results">Không tìm thấy kết quả</li>
                            )}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Phương thức thanh toán */}
                <div className="checkout-section">
                  <h2 className="checkout-section-title">
                    <FontAwesomeIcon icon={faCreditCard} className="section-icon" />
                    Phương thức thanh toán
                  </h2>
                  <div className="checkout-section-content">
                    <div className="payment-methods">
                      <div className="payment-method-item">
                        <label>
                          <input 
                            type="radio" 
                            name="paymentMethod" 
                            value="cod" 
                            checked={orderInfo.paymentMethod === "cod"}
                            onChange={handleInputChange}
                          />
                          <span className="payment-method-name">Thanh toán khi nhận hàng (COD)</span>
                        </label>
                      </div>
                      <div className="payment-method-item">
                        <label>
                          <input 
                            type="radio" 
                            name="paymentMethod" 
                            value="banking" 
                            checked={orderInfo.paymentMethod === "banking"}
                            onChange={handleInputChange}
                          />
                          <span className="payment-method-name">Chuyển khoản ngân hàng</span>
                        </label>
                      </div>
                      <div className="payment-method-item">
                        <label>
                          <input 
                            type="radio" 
                            name="paymentMethod" 
                            value="momo" 
                            checked={orderInfo.paymentMethod === "momo"}
                            onChange={handleInputChange}
                          />
                          <span className="payment-method-name">Ví điện tử MoMo</span>
                        </label>
                      </div>
                      <div className="payment-method-item">
                        <label>
                          <input 
                            type="radio" 
                            name="paymentMethod" 
                            value="card" 
                            checked={orderInfo.paymentMethod === "card"}
                        onChange={handleInputChange} 
                    />
                          <span className="payment-method-name">Thẻ tín dụng/Ghi nợ</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Ghi chú */}
                <div className="checkout-section">
                  <h2 className="checkout-section-title">
                    <FontAwesomeIcon icon={faNoteSticky} className="section-icon" />
                    Ghi chú đơn hàng
                  </h2>
                  <div className="checkout-section-content">
                    <div className="checkout-form-group">
                      <textarea
                        name="notes"
                        value={orderInfo.notes}
                        onChange={handleInputChange}
                        placeholder="Ghi chú về đơn hàng, ví dụ: thời gian giao hàng hay địa điểm giao hàng chi tiết hơn."
                      ></textarea>
                    </div>
                  </div>
                </div>
              </form>
            </div>
            
            {/* Phần tóm tắt đơn hàng */}
            <div className="checkout-page-summary-section">
              <div className="checkout-summary">
                <h2 className="checkout-summary-title">Tóm tắt đơn hàng</h2>
                <div className="checkout-summary-products">
                  {selectedItems.map(item => (
                    <div key={item.cartItemId || item.id} className="checkout-summary-item">
                      <div className="checkout-summary-item-image">
                        <img src={item.image} alt={item.name} />
                        <span className="checkout-summary-item-quantity">{item.quantity}</span>
                      </div>
                      <div className="checkout-summary-item-info">
                        <h3 className="checkout-summary-item-name">{item.name}</h3>
                        <p className="checkout-summary-item-options">
                          {item.selectedColor && <span>Màu: {item.selectedColor}</span>}
                          {item.selectedSize && <span>Size: {item.selectedSize}</span>}
                        </p>
                      </div>
                      <div className="checkout-summary-item-price">
                        {(item.price * item.quantity).toLocaleString()} ₫
                            </div>
                        </div>
                    ))}
                </div>
                
                <div className="checkout-summary-totals">
                  <div className="checkout-summary-row">
                    <span>Tạm tính</span>
                    <span>{calculateTotal().toLocaleString()} ₫</span>
                  </div>
                  <div className="checkout-summary-row">
                    <span>Phí vận chuyển</span>
                    <span>{shippingFee.toLocaleString()} ₫</span>
                  </div>
                  <div className="checkout-summary-row total">
                    <span>Tổng cộng</span>
                    <span>{(calculateTotal() + shippingFee).toLocaleString()} ₫</span>
            </div>
                </div>
                
                <button 
                  type="button" 
                  className="checkout-submit-button"
                  onClick={handleSubmitOrder}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      Đặt hàng ngay
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
            </div>
        </div>
    );
};

export default CheckoutPage;
