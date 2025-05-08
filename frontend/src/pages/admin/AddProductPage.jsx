import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faTimes,
  faUpload,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import "../../styles/css/Admin/AddProduct.css";
import { getAllCategory, getCategoryById } from "../../service/categoryAPI";
import {
  createProduct,
  getProductById,
  updateProduct,
} from "../../service/productAPI";

import {
  uploadPictures,
  deletePicture,
  getPictureByLink,
} from "../../service/PictureAPI";

const AddProductPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState([]);
  const { id } = useParams();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    discountPrice: "",
    price: "",
    discountPercentage: "",
    category: "",
    tagCategory: "",
    stock: "",
    colors: [],
    sizes: [],
    attributes: [],
    images: [], // Trường lưu link ảnh
    brand: "",
    isPublished: true,
  });

  const [formErrors, setFormErrors] = useState({});

  // Fetch categories when component mounts
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesResponse = await getAllCategory();
        setCategories(categoriesResponse.categories);
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast.error("Không thể tải danh mục sản phẩm");
      }
    };

    fetchCategories();
  }, []);

  // Lấy dữ liệu cũ nếu có ID sản phẩm
  useEffect(() => {
    if (id) {
      getProductById(id)
        .then(async (data) => {
          const URLreview = await Promise.all(
            data.images.map((image) => getPictureByLink(image))
          );
          const URLreviewList = URLreview.map((item) => {
            if (item[0]) {
              return item[0];
            } else {
              return "test";
            }
          });
          console.log("URLreview", URLreviewList);
          setImagePreviewUrls(URLreviewList); // Các URL thực tế sau khi gọi API
          setFormData({
            name: data.name || "",
            description: data.description || "",
            discountPrice: data.discountPrice || "",
            category: data.category || "",
            brand: data.brand || "",
            colors: data.colors || [],
            sizes: data.sizes || [],
            stock: data.stock || "",
            images: data.images || [],
            attributes: data.attributes || [],
            price: data.price || "",
            discountPercentage: data.discountPercentage || "",
            tagCategory: data.tagCategory || "",
            isPublished: data.isPublished ?? true, // nên dùng ?? thay vì ||
          });
        })
        .catch((error) => {
          console.error("Lỗi khi tải sản phẩm:", error);
        });
    }
  }, [id]);

  // Handle text input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "category") {
      // Tìm category được chọn
      const selectedCategory = categories.find((cat) => cat._id === value);

      // Cập nhật cả category và tagCategory
      setFormData({
        ...formData,
        category: value,
        tagCategory: selectedCategory ? selectedCategory.tagCategory : "",
      });
    } else if (
      name === "discountPrice" ||
      name === "price" ||
      name === "stock" ||
      name === "discountPercentage"
    ) {
      const numericValue = value.replace(/[^0-9.]/g, "");
      setFormData({ ...formData, [name]: numericValue });
    } else {
      setFormData({ ...formData, [name]: value });
    }

    // Xóa lỗi khi người dùng chỉnh sửa
    if (!id && formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: null });
    }
  };

  // Handle boolean inputs
  const handleBooleanChange = (e) => {
    const { name, checked } = e.target;
    setFormData({ ...formData, [name]: checked });
  };

  // Handle image upload
  const handleImageUpload = async (e) => {
    e.preventDefault();
    const files = Array.from(e.target.files);
    const newFiles = [...imageFiles, ...files].slice(0, 5); // Tối đa 5 ảnh
    const responsePicture = await uploadPictures(newFiles); // Gửi ảnh lên server và nhận link ảnh

    // Cập nhật danh sách file ảnh
    setImageFiles(responsePicture);

    // Cập nhật danh sách URL xem trước
    setImagePreviewUrls((prev) => [...prev, ...responsePicture]);

    // Thêm link ảnh vào trường images trong formData
    const newImageLinks = responsePicture.map((picture) => picture.link);
    setFormData({
      ...formData,
      images: [...formData.images, ...newImageLinks],
    });
  };

  // Remove an image from the list
  const removeImage = async (index, picture) => {
    console.log(picture);

    // Xóa file ảnh khỏi danh sách file
    const newFiles = [...imageFiles];
    newFiles.splice(index, 1);
    setImageFiles(newFiles);

    // Xóa link ảnh khỏi trường images trong formData
    const newImageLinks = [...formData.images];
    newImageLinks.splice(index, 1);
    setFormData({
      ...formData,
      images: newImageLinks,
    });

    // Xóa ảnh khỏi server
    await deletePicture(picture.id);

    // Xóa URL xem trước
    const newPreviews = [...imagePreviewUrls];
    newPreviews.splice(index, 1);
    setImagePreviewUrls(newPreviews);
  };

  // Handle attribute add/remove/change
  const [newAttribute, setNewAttribute] = useState({ name: "", value: "" });

  const addAttribute = () => {
    if (newAttribute.name.trim() && newAttribute.value.trim()) {
      setFormData({
        ...formData,
        attributes: [...formData.attributes, { ...newAttribute }],
      });
      setNewAttribute({ name: "", value: "" });
    } else {
      toast.warning("Vui lòng nhập tên và giá trị thuộc tính");
    }
  };

  const removeAttribute = (index) => {
    const newAttributes = [...formData.attributes];
    newAttributes.splice(index, 1);
    setFormData({ ...formData, attributes: newAttributes });
  };

  const handleAttributeChange = (e) => {
    const { name, value } = e.target;
    setNewAttribute({ ...newAttribute, [name]: value });
  };

  // Form validation
  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) errors.name = "Tên sản phẩm là bắt buộc";
    if (!formData.description.trim())
      errors.description = "Mô tả sản phẩm là bắt buộc";
    if (!formData.discountPrice)
      errors.discountPrice = "Giá sản phẩm là bắt buộc";
    if (!formData.category) errors.category = "Danh mục sản phẩm là bắt buộc";
    if (!formData.stock) errors.stock = "Số lượng tồn kho là bắt buộc";
    if (Number(formData.discountPrice) <= 0)
      errors.discountPrice = "Giá sản phẩm phải lớn hơn 0";
    if (
      formData.price &&
      Number(formData.price) <= Number(formData.discountPrice)
    ) {
      errors.price = "Giá gốc phải lớn hơn giá bán";
    }
    if (
      formData.discountPercentage &&
      (Number(formData.discountPercentage) <= 0 ||
        Number(formData.discountPercentage) > 100)
    ) {
      errors.discountPercentage = "Phần trăm giảm giá phải từ 1-100%";
    }
    if (!id && imageFiles.length === 0)
      errors.images = "Cần ít nhất một hình ảnh cho sản phẩm";
    if (formData.colors.length === 0) {
      errors.colors = "Vui lòng nhập ít nhất một màu sắc";
    }
    if (formData.sizes.length === 0) {
      errors.sizes = "Vui lòng nhập ít nhất một kích thước";
    }
    if (!formData.brand.trim()) {
      errors.brand = "Thương hiệu là bắt buộc";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit the form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Vui lòng kiểm tra lại thông tin sản phẩm");
      return;
    }

    setLoading(true);

    try {
      // Create form data object to handle both text fields and files
      const productFormData = new FormData();

      // Add text fields
      Object.keys(formData).forEach((key) => {
        if (key === "attributes" || key === "colors" || key === "sizes") {
          productFormData.append(key, JSON.stringify(formData[key]));
        } else {
          productFormData.append(key, formData[key]);
        }
      });

      // Add image files
      imageFiles.forEach((file) => {
        productFormData.append("images", file);
      });

      if (id) {
        await updateProduct(id, formData); // Cập nhật sản phẩm
        toast.success("Chỉnh sửa sản phẩm thành công!");
      } else {
        // Submit the form data
        await createProduct(formData);
        toast.success("Tạo sản phẩm thành công!");
        // navigate(`/admin/products/${response.data._id}`);
      }

      navigate(`/admin/products`);
    } catch (error) {
      console.error("Error adding product:", error);
      toast.error(
        error.response?.data?.message ||
          "Không thể tạo sản phẩm, vui lòng thử lại sau"
      );
    } finally {
      setLoading(false);
    }
  };

  // Calculate discount if original discountPrice and discount percentage are provided
  useEffect(() => {
    if (formData.price && formData.discountPercentage) {
      const original = parseFloat(formData.price);
      const discount = parseFloat(formData.discountPercentage);

      if (
        !isNaN(original) &&
        !isNaN(discount) &&
        original > 0 &&
        discount > 0
      ) {
        const calculatedPrice = original - (original * discount) / 100;
        setFormData({ ...formData, discountPrice: calculatedPrice.toFixed(2) });
      }
    }
  }, [formData.price, formData.discountPercentage]);

  return (
    <div className="add-product-page">
      <div className="page-header">
        <h1>{id ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}</h1>
        <button
          className="btn btn-secondary"
          onClick={() => navigate("/admin/products")}
        >
          Quay lại danh sách
        </button>
      </div>

      <form onSubmit={handleSubmit} className="product-form">
        <div className="form-grid">
          {/* Left side - Basic Information */}
          <div className="form-column">
            <div className="form-section">
              <h2>Thông tin cơ bản</h2>

              <div className="form-group">
                <label htmlFor="name">
                  Tên sản phẩm <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={formErrors.name ? "error" : ""}
                />
                {formErrors.name && (
                  <div className="error-message">{formErrors.name}</div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="description">
                  Mô tả <span className="required">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={6}
                  className={formErrors.description ? "error" : ""}
                />
                {formErrors.description && (
                  <div className="error-message">{formErrors.description}</div>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="category">
                    Danh mục <span className="required">*</span>
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className={formErrors.category ? "error" : ""}
                  >
                    <option value="">-- Chọn danh mục --</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  {formErrors.category && (
                    <div className="error-message">{formErrors.category}</div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="brand">
                    Thương hiệu <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="brand"
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    className={formErrors.brand ? "error" : ""}
                    placeholder="Nhập tên thương hiệu (VD: Nike, Adidas)"
                  />
                  {formErrors.brand && (
                    <div className="error-message">{formErrors.brand}</div>
                  )}
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="stock">
                  Tồn kho <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="stock"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  className={formErrors.stock ? "error" : ""}
                />
                {formErrors.stock && (
                  <div className="error-message">{formErrors.stock}</div>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="colors">Màu sắc</label>
                  <input
                    type="text"
                    id="colors"
                    name="colors"
                    value={formData.colors.join(", ")} // Hiển thị danh sách màu dưới dạng chuỗi
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        colors: e.target.value
                          .split(",")
                          .map((color) => color.trim()),
                      })
                    }
                    placeholder="Nhập các màu, cách nhau bằng dấu phẩy (VD: Đỏ, Xanh, Vàng)"
                  />
                  {formErrors.colors && (
                    <div className="error-message">{formErrors.colors}</div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="sizes">Kích thước</label>
                  <input
                    type="text"
                    id="sizes"
                    name="sizes"
                    value={formData.sizes.join(", ")} // Hiển thị danh sách kích thước dưới dạng chuỗi
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        sizes: e.target.value
                          .split(",")
                          .map((size) => size.trim()),
                      })
                    }
                    placeholder="Nhập các kích thước, cách nhau bằng dấu phẩy (VD: S, M, L, XL)"
                  />
                  {formErrors.sizes && (
                    <div className="error-message">{formErrors.sizes}</div>
                  )}
                </div>
              </div>
            </div>

            <div className="form-section">
              <h2>Giá sản phẩm</h2>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="price">Giá gốc</label>
                  <div className="input-with-prefix">
                    <span className="input-prefix">₫</span>
                    <input
                      type="text"
                      id="price"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      className={formErrors.price ? "error" : ""}
                    />
                  </div>
                  {formErrors.price && (
                    <div className="error-message">{formErrors.price}</div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="discountPercentage">Giảm giá (%)</label>
                  <div className="input-with-suffix">
                    <input
                      type="text"
                      id="discountPercentage"
                      name="discountPercentage"
                      value={formData.discountPercentage}
                      onChange={handleInputChange}
                      className={formErrors.discountPercentage ? "error" : ""}
                    />
                    <span className="input-suffix">%</span>
                  </div>
                  {formErrors.discountPercentage && (
                    <div className="error-message">
                      {formErrors.discountPercentage}
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="discountPrice">
                  Giá bán <span className="required">*</span>
                </label>
                <div className="input-with-prefix">
                  <span className="input-prefix">₫</span>
                  <input
                    type="text"
                    id="discountPrice"
                    name="discountPrice"
                    value={formData.discountPrice}
                    onChange={handleInputChange}
                    className={formErrors.discountPrice ? "error" : ""}
                  />
                </div>
                {formErrors.discountPrice && (
                  <div className="error-message">
                    {formErrors.discountPrice}
                  </div>
                )}
                {formData.price && formData.discountPrice && (
                  <div className="info-message">
                    Giảm{" "}
                    {(
                      ((formData.price - formData.discountPrice) /
                        formData.price) *
                      100
                    ).toFixed(0)}
                    %
                  </div>
                )}
              </div>

              <div className="form-group checkbox-group">
                <label htmlFor="isPublished">
                  <input
                    type="checkbox"
                    id="isPublished"
                    name="isPublished"
                    checked={formData.isPublished}
                    onChange={handleBooleanChange}
                  />
                  <span>Hiển thị sản phẩm trên trang web</span>
                </label>
              </div>
            </div>
          </div>

          {/* Right side - Images and Attributes */}
          <div className="form-column">
            <div className="form-section">
              <h2>
                Hình ảnh sản phẩm <span className="required">*</span>
              </h2>

              <div className="image-upload-container">
                <div className="image-preview-grid">
                  {imagePreviewUrls.map((picture, index) => (
                    <div key={index} className="image-preview-item">
                      <img src={picture.link} alt={`Preview ${index + 1}`} />
                      <button
                        type="button"
                        className="remove-image-btn"
                        onClick={() => removeImage(index, picture)}
                      >
                        {" "}
                        <FontAwesomeIcon icon={faTimes} />
                      </button>
                    </div>
                  ))}

                  {imagePreviewUrls.length < 5 && (
                    <label className="upload-box">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        multiple={true}
                        style={{ display: "none" }}
                      />
                      <div className="upload-icon">
                        <FontAwesomeIcon icon={faUpload} />
                      </div>
                      <span>Tải lên</span>
                    </label>
                  )}
                </div>

                <div className="image-info">
                  <p>Tối đa 5 ảnh, định dạng JPG, PNG hoặc GIF</p>
                  <p>Ảnh đầu tiên sẽ là ảnh chính của sản phẩm</p>
                </div>

                {!id && formErrors.images && (
                  <div className="error-message with-icon">
                    <FontAwesomeIcon icon={faExclamationTriangle} />
                    {formErrors.images}
                  </div>
                )}
              </div>
            </div>

            <div className="form-section">
              <h2>Thuộc tính sản phẩm</h2>

              <div className="attributes-container">
                {formData.attributes.length > 0 ? (
                  <div className="attributes-list">
                    {formData.attributes.map((attr, index) => (
                      <div key={index} className="attribute-item">
                        <span className="attribute-name">{attr.name}:</span>
                        <span className="attribute-value">{attr.value}</span>
                        <button
                          type="button"
                          className="remove-attribute-btn"
                          onClick={() => removeAttribute(index)}
                        >
                          <FontAwesomeIcon icon={faTimes} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-attributes">Chưa có thuộc tính</div>
                )}

                <div className="add-attribute-form">
                  <div className="attribute-inputs">
                    <input
                      type="text"
                      placeholder="Tên thuộc tính"
                      name="name"
                      value={newAttribute.name}
                      onChange={handleAttributeChange}
                    />
                    <input
                      type="text"
                      placeholder="Giá trị"
                      name="value"
                      value={newAttribute.value}
                      onChange={handleAttributeChange}
                    />
                  </div>
                  <button
                    type="button"
                    className="add-attribute-btn"
                    onClick={addAttribute}
                  >
                    <FontAwesomeIcon icon={faPlus} />
                    Thêm
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate("/admin/products")}
            disabled={loading}
          >
            Hủy
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Đang xử lý..." : id ? "Lưu sản phẩm" : "Tạo sản phẩm"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProductPage;
