const ProductDetailPage = () => {
  // ... các state và useEffect giữ nguyên ...

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert('Vui lòng chọn kích thước');
      return;
    }
    
    if (!selectedColor) {
      alert('Vui lòng chọn màu sắc');
      return;
    }
    
    const productToAdd = {
      id: product._id,  
      name: product.name,
      price: product.price,
      images: product.images,
      selectedSize,
      selectedColor,
      quantity
    };
    
    addToCart(productToAdd);
    setAddedToCart(true);
    
    setTimeout(() => {
      setAddedToCart(false);
    }, 3000);
  };

  // ... các hàm xử lý khác giữ nguyên ...

  // Render loading state
  if (loading) {
    return (
      <div className="product-detail-loading">
        <div className="spinner"></div>
        <p>Đang tải thông tin sản phẩm...</p>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="product-detail-error">
        <h2>Đã xảy ra lỗi!</h2>
        <p>{error}</p>
        <Link to="/products" className="back-button">
          <FontAwesomeIcon icon={faArrowLeft} /> Quay lại danh sách sản phẩm
        </Link>
      </div>
    );
  }

  // Render not found state
  if (!product) {
    return (
      <div className="product-detail-not-found">
        <h2>Không tìm thấy sản phẩm</h2>
        <p>Sản phẩm này không tồn tại hoặc đã bị xóa.</p>
        <Link to="/products" className="back-button">
          <FontAwesomeIcon icon={faArrowLeft} /> Quay lại danh sách sản phẩm
        </Link>
      </div>
    );
  }

  // Main render
  return (
    <div className="product-detail-container">
      {/* ... phần còn lại của JSX giữ nguyên ... */}
    </div>
  );
};

export default ProductDetailPage;