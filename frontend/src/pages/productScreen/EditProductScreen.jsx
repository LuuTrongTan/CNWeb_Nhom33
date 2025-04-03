import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getProductFilter, deleteProduct } from "../../service/productAPI";
import styles from "../styles/productListStyle/EditProducts.module.scss";

const EditProducts = () => {
  const [products, setProducts] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const itemsPerPage = 12; // Số sản phẩm mỗi trang
  const navigate = useNavigate();

  useEffect(() => {
    const getProducts = async () => {
      try {
        const data = await getProductFilter("", "", "", page, itemsPerPage);
        setProducts(data.docs);
        setTotalPages(data.totalPages);
      } catch (error) {
        console.error("Không thể lấy sản phẩm:", error);
      }
    };

    getProducts();
  }, [page]);

  const handleAddNewProduct = () => {
    navigate("/add-product");
  };

  const handleEdit = (product) => {
    navigate(`/edit-product/${product._id}`);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa?")) {
      try {
        await deleteProduct(id);
        setProducts(products.filter((product) => product._id !== id));
      } catch (error) {
        console.error("Xóa sản phẩm thất bại:", error);
      }
    }
  };

  return (
    <div className={styles.container}>
      <button onClick={() => navigate(-1)} className={styles.backButton}>
        <i className="fa-solid fa-arrow-left"></i> Quay về
      </button>
      <div className={styles.header}>
        <h2>Danh sách sản phẩm</h2>
        <button
          className={styles.addButton}
          onClick={() => handleAddNewProduct()}
        >
          <i className="fa-solid fa-plus"></i> Thêm sản phẩm
        </button>
      </div>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Tên</th>
            <th>Mô tả</th>
            <th>Giá</th>
            <th>Danh mục</th>
            <th>Thương hiệu</th>
            <th>Màu sắc</th>
            <th>Kích thước</th>
            <th>Tồn kho</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product._id}>
              <td>{product.name}</td>
              <td>{product.description}</td>
              <td>{product.price}</td>
              <td>{product.category?.name}</td>
              <td>{product.brand}</td>
              <td>{product.colors.join(", ")}</td>
              <td>{product.sizes.join(", ")}</td>
              <td>{product.stock}</td>
              <td>
                <div className={styles.button}>
                  <button
                    onClick={() => handleEdit(product)}
                    className={styles.editButton}
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => handleDelete(product._id)}
                    className={styles.deleteButton}
                  >
                    Xóa
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Thanh chuyển trang */}
      <div className={styles.pagination}>
        <button
          onClick={() => setPage(page > 1 ? page - 1 : 1)}
          disabled={page === 1}
          className={styles.paginationButton}
        >
          ⬅ Trước
        </button>
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index}
            onClick={() => setPage(index + 1)}
            className={`${styles.paginationButton} ${page === index + 1 ? styles.active : ""}`}
          >
            {index + 1}
          </button>
        ))}
        <button
          onClick={() => setPage(page < totalPages ? page + 1 : totalPages)}
          disabled={page === totalPages}
          className={styles.paginationButton}
        >
          Sau ➡
        </button>
      </div>
    </div>
  );
};

export default EditProducts;
