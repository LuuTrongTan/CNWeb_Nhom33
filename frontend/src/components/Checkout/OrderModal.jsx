import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faSpinner } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";

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

const OrderModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { cart, calculateTotal, clearCart, getSelectedItems } = useCart();
  const { isAuthenticated, currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingUserInfo, setLoadingUserInfo] = useState(false);
  const [orderInfo, setOrderInfo] = useState({
    fullName: "",
    address: "",
    city: "",
    district: "",
    ward: "",
    phone: "",
    paymentMethod: "cod",
    notes: ""
  });

  // Lấy thông tin người dùng đã đăng nhập
  useEffect(() => {
    const fetchUserShippingInfo = async () => {
      if (isAuthenticated) {
        try {
          setLoadingUserInfo(true);
          const response = await api.get('/users/shipping-info');
          
          setOrderInfo(prev => ({
            ...prev,
            fullName: response.data.fullName || "",
            address: response.data.address || "",
            city: response.data.city || "",
            district: response.data.district || "",
            ward: response.data.ward || "",
            phone: response.data.phone || ""
          }));
        } catch (error) {
          console.error("Lỗi khi lấy thông tin người dùng:", error);
        } finally {
          setLoadingUserInfo(false);
        }
      }
    };

    if (isOpen) {
      fetchUserShippingInfo();
    }
  }, [isAuthenticated, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setOrderInfo(prev => ({ ...prev, [name]: value }));
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
        notes: orderInfo.notes,
        totalItemsPrice: calculateTotal(),
        shippingPrice: 0,
        taxPrice: 0,
        discountPrice: 0
      };

      // Gọi API tạo đơn hàng
      const response = await api.post("/orders", orderData);
      
      // Xử lý thành công
      alert("Đặt hàng thành công! Mã đơn hàng: " + response.data.id);
      clearCart();
      onClose();
      navigate("/orders/" + response.data.id);
    } catch (error) {
      console.error("Lỗi khi đặt hàng:", error);
      alert("Có lỗi xảy ra khi đặt hàng: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const selectedItems = getSelectedItems();
  
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto mx-4">
        <div className="sticky top-0 bg-white px-6 py-4 border-b flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Đặt hàng</h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <FontAwesomeIcon icon={faTimes} size="lg" />
          </button>
        </div>
        
        <div className="p-6">
          {loadingUserInfo ? (
            <div className="flex justify-center py-6">
              <FontAwesomeIcon icon={faSpinner} spin size="2x" className="text-blue-500" />
            </div>
          ) : (
            <form onSubmit={handleSubmitOrder}>
              {/* Thông tin giao hàng */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 pb-2 border-b text-gray-700">Thông tin giao hàng</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Họ tên <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      name="fullName" 
                      value={orderInfo.fullName}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500" 
                      required
                    />
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại <span className="text-red-500">*</span></label>
                    <input 
                      type="tel" 
                      name="phone" 
                      value={orderInfo.phone}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500" 
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      name="address" 
                      value={orderInfo.address}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500" 
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tỉnh/Thành phố <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      name="city" 
                      value={orderInfo.city}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500" 
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quận/Huyện <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      name="district" 
                      value={orderInfo.district}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500" 
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phường/Xã <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      name="ward" 
                      value={orderInfo.ward}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500" 
                      required
                    />
                  </div>
                </div>
              </div>
              
              {/* Phương thức thanh toán */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 pb-2 border-b text-gray-700">Phương thức thanh toán</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="payment-method">
                    <label className="flex items-center p-3 border rounded hover:bg-gray-50 transition cursor-pointer">
                      <input 
                        type="radio" 
                        name="paymentMethod" 
                        value="cod" 
                        checked={orderInfo.paymentMethod === "cod"}
                        onChange={handleInputChange}
                        className="mr-2 text-blue-600" 
                      />
                      <span>Thanh toán khi nhận hàng (COD)</span>
                    </label>
                  </div>
                  <div className="payment-method">
                    <label className="flex items-center p-3 border rounded hover:bg-gray-50 transition cursor-pointer">
                      <input 
                        type="radio" 
                        name="paymentMethod" 
                        value="banking" 
                        checked={orderInfo.paymentMethod === "banking"}
                        onChange={handleInputChange}
                        className="mr-2 text-blue-600" 
                      />
                      <span>Chuyển khoản ngân hàng</span>
                    </label>
                  </div>
                  <div className="payment-method">
                    <label className="flex items-center p-3 border rounded hover:bg-gray-50 transition cursor-pointer">
                      <input 
                        type="radio" 
                        name="paymentMethod" 
                        value="momo" 
                        checked={orderInfo.paymentMethod === "momo"}
                        onChange={handleInputChange}
                        className="mr-2 text-blue-600" 
                      />
                      <span>Ví điện tử MoMo</span>
                    </label>
                  </div>
                  <div className="payment-method">
                    <label className="flex items-center p-3 border rounded hover:bg-gray-50 transition cursor-pointer">
                      <input 
                        type="radio" 
                        name="paymentMethod" 
                        value="card" 
                        checked={orderInfo.paymentMethod === "card"}
                        onChange={handleInputChange}
                        className="mr-2 text-blue-600" 
                      />
                      <span>Thẻ tín dụng/Ghi nợ</span>
                    </label>
                  </div>
                </div>
              </div>
              
              {/* Ghi chú */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 pb-2 border-b text-gray-700">Ghi chú đơn hàng</h3>
                <textarea
                  name="notes"
                  value={orderInfo.notes}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                  rows="3"
                  placeholder="Ghi chú về đơn hàng, ví dụ: thời gian giao hàng hay địa điểm giao hàng chi tiết hơn."
                ></textarea>
              </div>
              
              {/* Tóm tắt đơn hàng */}
              <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 text-gray-700">Tóm tắt đơn hàng</h3>
                <div className="max-h-48 overflow-y-auto mb-4 pr-2">
                  {selectedItems.map(item => (
                    <div key={item.cartItemId || item.id} className="flex justify-between py-2 border-b">
                      <div className="flex items-center">
                        <img src={item.image} alt={item.name} className="w-10 h-10 object-cover rounded mr-3" />
                        <div>
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-gray-500">
                            {item.selectedColor && <span>Màu: {item.selectedColor} | </span>}
                            {item.selectedSize && <span>Size: {item.selectedSize} | </span>}
                            <span>SL: {item.quantity}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div>{(item.price * item.quantity).toLocaleString()} ₫</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between py-2 text-lg font-bold border-t border-gray-400">
                  <span>Tổng cộng:</span>
                  <span>{calculateTotal().toLocaleString()} ₫</span>
                </div>
              </div>
              
              <div className="flex justify-between mt-6">
                <button 
                  type="button" 
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
                >
                  Quay lại
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition flex items-center"
                  disabled={loading}
                >
                  {loading && <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />}
                  {loading ? "Đang xử lý..." : "Đặt hàng"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderModal; 