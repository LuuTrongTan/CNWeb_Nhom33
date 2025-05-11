# Hệ thống Giỏ hàng và Thanh toán - Đồ án Web

Hệ thống cửa hàng trực tuyến với tính năng giỏ hàng và thanh toán đa dạng, có tích hợp tính năng tính phí vận chuyển tự động theo địa chỉ nhận hàng.

## Tính năng chính

- Giỏ hàng hoạt động cho cả khách đăng nhập và chưa đăng nhập (lưu trong MongoDB và localStorage)
- Các phương thức thanh toán đa dạng (COD, Banking, MoMo, Credit Card)
- Tính phí vận chuyển tự động theo địa chỉ thực tế
- Tích hợp với API GHN (Giao Hàng Nhanh) cho việc tính phí vận chuyển chính xác
- Đồng bộ giỏ hàng từ localStorage lên MongoDB khi đăng nhập

## Cài đặt

1. Clone repository
2. Cài đặt dependencies cho backend và frontend:
   ```bash
   # Backend
   cd backend
   npm install

   # Frontend
   cd ../frontend
   npm install
   ```
3. Tạo file `.env` trong thư mục `backend`:
   ```
   NODE_ENV=development
   PORT=8080
   MONGODB_URL=mongodb://localhost:27017/ecommerce
   JWT_SECRET=yoursecretkey
   JWT_ACCESS_EXPIRATION_MINUTES=30
   JWT_REFRESH_EXPIRATION_DAYS=30
   JWT_RESET_PASSWORD_EXPIRATION_MINUTES=10
   JWT_VERIFY_EMAIL_EXPIRATION_MINUTES=10
   
   # GHN API Configuration
   GHN_TOKEN=your_ghn_token
   GHN_SHOP_ID=your_shop_id
   
   # Store Information
   STORE_NAME=Shop Bách Khoa
   STORE_ADDRESS=Số 1 Đại Cồ Việt, Hai Bà Trưng, Hà Nội
   STORE_PROVINCE=Hà Nội
   STORE_DISTRICT=Hai Bà Trưng
   STORE_WARD=Bách Khoa
   STORE_PHONE=0987654321
   ```
4. Chạy development server:
   ```bash
   # Backend
   cd backend
   npm run dev
   
   # Frontend
   cd ../frontend
   npm run dev
   ```

## Thiết lập tính phí vận chuyển

Hệ thống sử dụng API từ GHN (Giao Hàng Nhanh) để tính phí vận chuyển tự động. Để thiết lập:

1. Đăng ký tài khoản tại [GHN Developer Portal](https://developer.ghn.vn/)
2. Lấy token API và Shop ID
3. Cập nhật các thông tin này vào file `.env` trong thư mục `backend`
4. Cập nhật thông tin của cửa hàng (địa chỉ, điểm lấy hàng) trong file `.env`

### Cấu trúc mã tỉnh/thành phố, quận/huyện, phường/xã

API GHN sử dụng mã số cho các khu vực địa lý:
- `ProvinceID`: Mã tỉnh/thành phố
- `DistrictID`: Mã quận/huyện
- `WardCode`: Mã phường/xã

Các mã này được sử dụng để gọi API tính phí vận chuyển. Hệ thống đã tích hợp các API sau:
- `/shipping/provinces`: Lấy danh sách tỉnh/thành phố
- `/shipping/districts/:provinceId`: Lấy danh sách quận/huyện của tỉnh/thành phố
- `/shipping/wards/:districtId`: Lấy danh sách phường/xã của quận/huyện

## Cấu hình dịch vụ vận chuyển

Trong file `backend/src/utils/shipping.js`:
- `SHOP_INFO`: Cấu hình thông tin địa chỉ cửa hàng (mặc định là Đại học Bách Khoa Hà Nội)
- Service ID GHN:
  - 1: Chuyển phát tiêu chuẩn (Fast)
  - 2: Chuyển phát nhanh (Express)
  - 3: Tiết kiệm (Standard)

## API Endpoints

### Vận chuyển (Shipping)
- `POST /api/shipping/calculate`: Tính phí vận chuyển
- `GET /api/shipping/provinces`: Lấy danh sách tỉnh/thành phố
- `GET /api/shipping/districts/:provinceId`: Lấy danh sách quận/huyện
- `GET /api/shipping/wards/:districtId`: Lấy danh sách phường/xã

### Giỏ hàng (Cart)
- `GET /api/cart`: Lấy giỏ hàng của người dùng đăng nhập
- `POST /api/cart/add`: Thêm sản phẩm vào giỏ hàng
- `PUT /api/cart/update`: Cập nhật số lượng sản phẩm trong giỏ hàng
- `DELETE /api/cart/:itemId`: Xóa sản phẩm khỏi giỏ hàng
- `POST /api/cart/sync`: Đồng bộ giỏ hàng localStorage với MongoDB

### Đơn hàng (Order)
- `POST /api/orders`: Tạo đơn hàng mới
- `GET /api/orders`: Lấy danh sách đơn hàng của người dùng
- `GET /api/orders/:id`: Lấy chi tiết đơn hàng

## Ghi chú

Để sử dụng API thực tế (không phải dữ liệu mẫu), cần phải có token API hợp lệ từ GHN. Nếu không có token, hệ thống sẽ sử dụng cơ chế dự phòng để tính phí vận chuyển dựa trên vùng miền.

## Đóng góp

Mọi đóng góp và phản hồi đều được chào đón. Vui lòng mở issue hoặc pull request nếu bạn muốn đóng góp cho dự án. 