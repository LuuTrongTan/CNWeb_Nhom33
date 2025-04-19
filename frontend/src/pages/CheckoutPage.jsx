import { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; 

const CheckoutPage = () => {
    const { cart, calculateTotal, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    
    // Danh sách tỉnh/thành phố
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);
    const [shippingFee, setShippingFee] = useState(0);
    
    const [shippingAddress, setShippingAddress] = useState({
        fullName: user?.name || "",
        address: "",
        province: "",
        district: "",
        ward: "",
        phone: user?.phone || "",
    });
    
    const [paymentMethod, setPaymentMethod] = useState("cod");

    // Lấy danh sách tỉnh/thành phố khi trang được tải
    useEffect(() => {
        // Mô phỏng lấy dữ liệu tỉnh/thành
        const mockProvinces = [
            { id: "HN", name: "Hà Nội" },
            { id: "HCM", name: "Hồ Chí Minh" },
            { id: "DN", name: "Đà Nẵng" },
            { id: "HP", name: "Hải Phòng" },
            { id: "CT", name: "Cần Thơ" }
        ];
        setProvinces(mockProvinces);
    }, []);

    // Lấy danh sách quận/huyện khi tỉnh thay đổi
    useEffect(() => {
        if (shippingAddress.province) {
            // Mô phỏng lấy dữ liệu quận/huyện
            const mockDistricts = {
                "HN": [
                    { id: "HN01", name: "Hoàn Kiếm" },
                    { id: "HN02", name: "Ba Đình" },
                    { id: "HN03", name: "Đống Đa" }
                ],
                "HCM": [
                    { id: "HCM01", name: "Quận 1" },
                    { id: "HCM02", name: "Quận 2" },
                    { id: "HCM03", name: "Quận 3" }
                ],
                "DN": [
                    { id: "DN01", name: "Hải Châu" },
                    { id: "DN02", name: "Thanh Khê" }
                ],
                "HP": [
                    { id: "HP01", name: "Ngô Quyền" },
                    { id: "HP02", name: "Hồng Bàng" }
                ],
                "CT": [
                    { id: "CT01", name: "Ninh Kiều" },
                    { id: "CT02", name: "Cái Răng" }
                ]
            };
            setDistricts(mockDistricts[shippingAddress.province] || []);
            setShippingAddress(prev => ({ ...prev, district: "", ward: "" }));
            
            // Tính phí vận chuyển theo tỉnh/thành
            const shippingRates = {
                "HN": 30000,
                "HCM": 30000,
                "DN": 40000,
                "HP": 40000,
                "CT": 50000
            };
            setShippingFee(shippingRates[shippingAddress.province] || 30000);
        }
    }, [shippingAddress.province]);

    // Lấy danh sách phường/xã khi quận/huyện thay đổi
    useEffect(() => {
        if (shippingAddress.district) {
            // Mô phỏng lấy dữ liệu phường/xã
            const mockWards = {
                "HN01": [{ id: "HN01W1", name: "Hàng Bạc" }, { id: "HN01W2", name: "Hàng Bồ" }],
                "HN02": [{ id: "HN02W1", name: "Phúc Xá" }, { id: "HN02W2", name: "Trúc Bạch" }],
                "HN03": [{ id: "HN03W1", name: "Cát Linh" }, { id: "HN03W2", name: "Văn Miếu" }],
                "HCM01": [{ id: "HCM01W1", name: "Bến Nghé" }, { id: "HCM01W2", name: "Bến Thành" }],
                "HCM02": [{ id: "HCM02W1", name: "Thảo Điền" }, { id: "HCM02W2", name: "An Phú" }],
                "HCM03": [{ id: "HCM03W1", name: "Phường 1" }, { id: "HCM03W2", name: "Phường 2" }],
                "DN01": [{ id: "DN01W1", name: "Hải Châu 1" }, { id: "DN01W2", name: "Hải Châu 2" }],
                "DN02": [{ id: "DN02W1", name: "Thanh Khê Đông" }, { id: "DN02W2", name: "Thanh Khê Tây" }],
                "HP01": [{ id: "HP01W1", name: "Lạch Tray" }, { id: "HP01W2", name: "Đông Khê" }],
                "HP02": [{ id: "HP02W1", name: "Quán Toan" }, { id: "HP02W2", name: "Hùng Vương" }],
                "CT01": [{ id: "CT01W1", name: "Tân An" }, { id: "CT01W2", name: "An Hội" }],
                "CT02": [{ id: "CT02W1", name: "Hưng Phú" }, { id: "CT02W2", name: "Ba Láng" }]
            };
            setWards(mockWards[shippingAddress.district] || []);
            setShippingAddress(prev => ({ ...prev, ward: "" }));
        }
    }, [shippingAddress.district]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setShippingAddress(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmitOrder = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            // Kiểm tra thông tin
            if (!shippingAddress.fullName || !shippingAddress.address || !shippingAddress.phone || 
                !shippingAddress.province || !shippingAddress.district || !shippingAddress.ward) {
                alert("Vui lòng điền đầy đủ thông tin giao hàng!");
                setLoading(false);
                return;
            }

            // Chuyển đổi thông tin sản phẩm
            const orderItems = cart.map(item => ({
                product: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                image: item.image,
                color: item.color || '',
                size: item.size || ''
            }));

            // Lấy tên địa chỉ từ ID
            const provinceName = provinces.find(p => p.id === shippingAddress.province)?.name || '';
            const districtName = districts.find(d => d.id === shippingAddress.district)?.name || '';
            const wardName = wards.find(w => w.id === shippingAddress.ward)?.name || '';

            // Tạo object đơn hàng
            const orderData = {
                items: orderItems,
                shippingAddress: {
                    fullName: shippingAddress.fullName,
                    address: shippingAddress.address,
                    city: provinceName,
                    district: districtName,
                    ward: wardName,
                    phone: shippingAddress.phone
                },
                paymentMethod: paymentMethod,
                shippingPrice: shippingFee,
                totalItemsPrice: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
                taxPrice: 0, // Thuế nếu có
                totalPrice: calculateTotal() + shippingFee
            };

            // Gửi đơn hàng lên server
            const res = await axios.post("/api/orders", orderData, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            // Xử lý tùy theo phương thức thanh toán
            if (paymentMethod === 'cod') {
                // Nếu là thanh toán khi nhận hàng, chuyển đến trang xác nhận
                clearCart();
                navigate(`/order-success/${res.data.id}`);
            } else if (paymentMethod === 'card') {
                // Xử lý thanh toán thẻ (giả lập)
                alert("Chức năng thanh toán thẻ đang được phát triển!");
                navigate(`/order/${res.data.id}`);
            } else if (paymentMethod === 'banking') {
                // Xử lý chuyển khoản (giả lập)
                alert("Chức năng chuyển khoản đang được phát triển!");
                navigate(`/order/${res.data.id}`);
            } else if (paymentMethod === 'momo') {
                // Xử lý MoMo (giả lập)
                alert("Chức năng thanh toán MoMo đang được phát triển!");
                navigate(`/order/${res.data.id}`);
            }
    } catch (err) {
            console.error(err);
            alert("Lỗi khi đặt hàng: " + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    if (cart.length === 0) {
        return (
            <div className="empty-cart p-6 max-w-4xl mx-auto text-center">
                <h1 className="text-2xl font-bold mb-4">Giỏ hàng trống</h1>
                <button onClick={() => navigate("/")} className="back-to-shop px-4 py-2 bg-blue-500 text-white rounded">
                    Quay lại mua sắm
                </button>
            </div>
        );
    }

    return (
        <div className="checkout-container p-6 max-w-4xl mx-auto bg-white shadow-lg rounded-lg my-6">
            <h1 className="text-2xl font-bold mb-6 text-center">Thanh toán</h1>
            
            <form onSubmit={handleSubmitOrder}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Thông tin giao hàng */}
                    <div className="md:col-span-2 space-y-4">
                        <div className="bg-gray-50 p-4 rounded-lg border">
                            <h2 className="text-lg font-semibold mb-4 text-gray-800">Thông tin giao hàng</h2>
                            
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Họ tên người nhận *</label>
                                    <input 
                                        type="text" 
                                        name="fullName" 
                                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-300 focus:border-blue-300" 
                                        value={shippingAddress.fullName}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại *</label>
                                    <input 
                                        type="tel" 
                                        name="phone" 
                                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-300 focus:border-blue-300" 
                                        value={shippingAddress.phone}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tỉnh/Thành phố *</label>
                                    <select 
                                        name="province" 
                                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-300 focus:border-blue-300" 
                                        value={shippingAddress.province}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="">Chọn Tỉnh/Thành phố</option>
                                        {provinces.map(province => (
                                            <option key={province.id} value={province.id}>{province.name}</option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Quận/Huyện *</label>
                                    <select 
                                        name="district" 
                                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-300 focus:border-blue-300" 
                                        value={shippingAddress.district}
                                        onChange={handleInputChange}
                                        required
                                        disabled={!shippingAddress.province}
                                    >
                                        <option value="">Chọn Quận/Huyện</option>
                                        {districts.map(district => (
                                            <option key={district.id} value={district.id}>{district.name}</option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phường/Xã *</label>
                                    <select 
                                        name="ward" 
                                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-300 focus:border-blue-300" 
                                        value={shippingAddress.ward}
                                        onChange={handleInputChange}
                                        required
                                        disabled={!shippingAddress.district}
                                    >
                                        <option value="">Chọn Phường/Xã</option>
                                        {wards.map(ward => (
                                            <option key={ward.id} value={ward.id}>{ward.name}</option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ cụ thể *</label>
                                    <input 
                                        type="text" 
                                        name="address" 
                                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-300 focus:border-blue-300" 
                                        placeholder="Số nhà, tên đường" 
                                        value={shippingAddress.address}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                        
                        {/* Phương thức thanh toán */}
                        <div className="bg-gray-50 p-4 rounded-lg border">
                            <h2 className="text-lg font-semibold mb-4 text-gray-800">Phương thức thanh toán</h2>
                            
                            <div className="space-y-2">
                                <label className="flex items-center p-3 border rounded cursor-pointer hover:bg-gray-50">
                                    <input 
                                        type="radio" 
                                        name="paymentMethod" 
                                        value="cod" 
                                        checked={paymentMethod === "cod"}
                                        onChange={e => setPaymentMethod(e.target.value)}
                                        className="mr-2" 
                                    />
                                    <span>Thanh toán khi nhận hàng (COD)</span>
                                </label>
                                
                                <label className="flex items-center p-3 border rounded cursor-pointer hover:bg-gray-50">
                                    <input 
                                        type="radio" 
                                        name="paymentMethod" 
                                        value="card" 
                                        checked={paymentMethod === "card"}
                                        onChange={e => setPaymentMethod(e.target.value)}
                                        className="mr-2" 
                                    />
                                    <span>Thanh toán bằng thẻ tín dụng (đang phát triển)</span>
                                </label>
                                
                                <label className="flex items-center p-3 border rounded cursor-pointer hover:bg-gray-50">
                                    <input 
                                        type="radio" 
                                        name="paymentMethod" 
                                        value="banking" 
                                        checked={paymentMethod === "banking"}
                                        onChange={e => setPaymentMethod(e.target.value)}
                                        className="mr-2" 
                                    />
                                    <span>Chuyển khoản ngân hàng (đang phát triển)</span>
                                </label>
                                
                                <label className="flex items-center p-3 border rounded cursor-pointer hover:bg-gray-50">
                                    <input 
                                        type="radio" 
                                        name="paymentMethod" 
                                        value="momo" 
                                        checked={paymentMethod === "momo"}
                                        onChange={e => setPaymentMethod(e.target.value)}
                                        className="mr-2" 
                                    />
                                    <span>Ví MoMo (đang phát triển)</span>
                                </label>
                            </div>
                        </div>
                    </div>
                    
                    {/* Tổng đơn hàng */}
                    <div className="md:col-span-1">
                        <div className="bg-gray-50 p-4 rounded-lg border sticky top-4">
                            <h2 className="text-lg font-semibold mb-4 text-gray-800">Đơn hàng của bạn</h2>
                            
                            <div className="space-y-3 mb-4">
                                {cart.map(item => (
                                    <div key={item.id} className="flex justify-between py-2 border-b">
                                        <div className="flex-1">
                                            <p className="font-medium">{item.name}</p>
                                            <p className="text-sm text-gray-600">SL: {item.quantity}</p>
                                        </div>
                                        <div className="text-right">
                                            <p>{(item.price * item.quantity).toLocaleString()}đ</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span>Tạm tính:</span>
                                    <span>{cart.reduce((sum, item) => sum + (item.price * item.quantity), 0).toLocaleString()}đ</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Phí vận chuyển:</span>
                                    <span>{shippingFee.toLocaleString()}đ</span>
                                </div>
                            </div>
                            
                            <div className="border-t mt-3 pt-3">
                                <div className="flex justify-between font-bold">
                                    <span>Tổng cộng:</span>
                                    <span className="text-lg">{(cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) + shippingFee).toLocaleString()}đ</span>
                                </div>
                            </div>
                            
                            <button 
                                type="submit" 
                                className="w-full mt-4 bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium disabled:bg-gray-400"
                                disabled={loading}
                            >
                                {loading ? "Đang xử lý..." : "Đặt hàng"}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default CheckoutPage;
