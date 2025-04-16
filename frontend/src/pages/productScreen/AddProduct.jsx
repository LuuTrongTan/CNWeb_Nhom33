import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  createProduct,
  getProductById,
  updateProduct,
} from "../../service/productAPI";
import styles from "../../styles/scss/productListStyle/AddProduct.module.scss";

const AddProduct = () => {
  const { id } = useParams(); // Lấy ID sản phẩm từ URL
  const navigate = useNavigate();

  const [product, setProduct] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    brand: "",
    colors: [],
    sizes: [],
    stock: "",
    images: [],
  });

  const [imagePreview, setImagePreview] = useState([]);

  // Lấy dữ liệu cũ nếu có ID sản phẩm
  useEffect(() => {
    if (id) {
      getProductById(id)
        .then((data) => {
          setProduct({
            name: data.name || "",
            description: data.description || "",
            price: data.price || "",
            category: data.category || "",
            brand: data.brand || "",
            colors: data.colors || [],
            sizes: data.sizes || [],
            stock: data.stock || "",
            images: data.images || [],
          });

          // Hiển thị ảnh preview từ URL
          setImagePreview(data.images || []);
        })
        .catch((error) => {
          console.error("Lỗi khi tải sản phẩm:", error);
        });
    }
  }, [id]);

  // Xử lý thay đổi input
  const handleChange = (e) => {
    setProduct({ ...product, [e.target.name]: e.target.value });
  };

  // Xử lý nhập nhiều màu sắc và kích thước
  const handleInputChange = (e, field) => {
    const newValues = e.target.value.split(",");

    setProduct((prev) => ({
      ...prev,
      [field]: newValues, // Cập nhật `colors` hoặc `sizes` tùy theo field
    }));
  };

  // Xử lý upload ảnh
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const previewUrls = files.map((file) => URL.createObjectURL(file));
    setImagePreview(previewUrls);

    setProduct({ ...product, images: files });
  };

  // Lưu dữ liệu (Thêm mới hoặc Cập nhật)
  const handleSave = async () => {
    const productData = {
      ...product,
      colors: product.colors, // ['Đen', 'Nâu']
      sizes: product.sizes, // ['M', 'L']
      images: product.images, // Mảng URL ảnh hoặc File
    };

    try {
      if (id) {
        await updateProduct(id, productData); // Cập nhật sản phẩm
        alert("Cập nhật sản phẩm thành công!");
      } else {
        await createProduct(productData); // Thêm sản phẩm mới
        alert("Thêm sản phẩm thành công!");
      }
      navigate("/edit-products");
    } catch (error) {
      console.error("Lỗi khi lưu sản phẩm:", error);
    }
  };

  return (
    <div className={styles.container}>
      <h2>{id ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}</h2>

      <div className={styles.formRow}>
        <div>
          <label>Tên sản phẩm</label>
          <input
            type="text"
            name="name"
            placeholder="Tên sản phẩm"
            value={product.name}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Mô tả sản phẩm</label>
          <input
            type="text"
            name="description"
            placeholder="Mô tả"
            value={product.description}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className={styles.formRow}>
        <div>
          <label>Giá sản phẩm</label>
          <input
            type="number"
            name="price"
            placeholder="Giá"
            value={product.price}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Danh mục</label>
          <input
            type="text"
            name="category"
            placeholder="Danh mục"
            value={product.category}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className={styles.formRow}>
        <div>
          <label>Thương hiệu</label>
          <input
            type="text"
            name="brand"
            placeholder="Thương hiệu"
            value={product.brand}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Số hàng trong kho</label>
          <input
            type="number"
            name="stock"
            placeholder="Tồn kho"
            value={product.stock}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className={styles.formRow}>
        <div>
          <label>Màu sắc</label>
          <input
            type="text"
            placeholder="Nhập màu sắc, cách nhau dấu phẩy"
            value={product.colors.join(",")}
            onChange={(e) => handleInputChange(e, "colors")}
          />
        </div>
        <div>
          <label>Kích thước</label>
          <input
            type="text"
            placeholder="Nhập kích thước, cách nhau dấu phẩy"
            value={product.sizes.join(",")}
            onChange={(e) => handleInputChange(e, "sizes")}
          />
        </div>
      </div>

      {/* Upload ảnh */}
      <div>
        <label>Ảnh minh họa</label>
        <input
          type="file"
          multiple
          onChange={handleImageUpload}
          className={styles.fileInput}
        />
        <div className={styles.imagePreview}>
          {imagePreview.map((src, index) => (
            <img key={index} src={src} alt={`preview-${index}`} />
          ))}
        </div>
      </div>

      {/* Nút lưu */}
      <div className={styles.buttons}>
        <button onClick={() => navigate(-1)} className={styles.cancelButton}>
          🔙 Quay lại
        </button>
        <button onClick={handleSave} className={styles.saveButton}>
          {id ? "Cập nhật" : "Lưu"}
        </button>
      </div>
    </div>
  );
};

export default AddProduct;
