import ProductCard from "./ProductCard";
import styles from "./styles/ProductList.module.scss";
import { useState, useContext, useEffect, useRef } from "react";
import { FilterContext } from "../context/FilterContext";
import { fetchProducts, getProductFilter } from "../service/productAPI";
import Loader from "./Loader";

const options = [
  "Mới nhất",
  "Bán chạy",
  "Giá thấp đến cao",
  "Giá cao đến thấp",
  "%Giảm giá nhiều",
];

const ProductList = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState("Mặc định");
  const { selectedFilter, setSelectedFilter } = useContext(FilterContext);
  const [isLoading, setIsLoading] = useState(false); // State để quản lý loading

  const handleDeleteFilter = () => {
    setSelectedFilter({
      sizes: [],
      color: "",
      category: {},
    });
  };

  const [products, setProducts] = useState([]);
  const [totalProduct, setTotalProduct] = useState({});

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  let usedPage = useRef(2);

  useEffect(() => {
    const getProducts = async () => {
      setIsLoading(true); // Bắt đầu loading

      try {
        const data = await getProductFilter(
          selectedFilter.color,
          selectedFilter.category._id,
          selectedFilter.sizes,
          page
        );
        setProducts(data.docs);
        setTotalProduct(data);
        // console.log(data);
        setTotalPages(data.totalPages);
      } catch (error) {
        console.error("Không thể lấy sản phẩm:", error);
      }
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    };

    getProducts();
    usedPage.current = 2;
  }, [page, selectedFilter]);

  // useEffect(() => {
  //   console.log(selectedFilter);
  // }, [selectedFilter]);

  const handleSeeMore = async () => {
    if (usedPage.current <= totalPages) {
      try {
        const data = await getProductFilter(
          selectedFilter.color,
          selectedFilter.category,
          selectedFilter.sizes,
          usedPage.current
        );
        usedPage.current++;
        setProducts((prev) => {
          return [...prev, ...data.docs];
        });
      } catch (error) {
        console.error("Không thể lấy sản phẩm:", error);
      }
    } else {
      alert("Không còn sản phẩm");
    }
    console.log(totalPages);
    console.log(usedPage.current);
  };

  const getTotalToShow = (totalPages) => {
    if (totalPages === 1) return totalProduct.totalDocs;
    if (totalPages > 1) {
      if (usedPage.current - 1 === totalPages) {
        return totalProduct.totalDocs;
      } else {
        return 12 * (usedPage.current - 1);
      }
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.nav_home}>
        <span>Trang chủ</span> / <span>{totalProduct.totalDocs} kết quả</span>
      </div>
      <div className={styles.category}>QUẦN ÁO</div>
      <div className={styles.line} />
      <div className={styles.filter}>
        <div className={styles.quantity}>
          {totalProduct.totalDocs} Kết quả
          <div className={styles.filters_result}>
            {Object.keys(selectedFilter.category).length > 0 ? (
              <div>{selectedFilter.category.name} </div>
            ) : (
              " "
            )}
            {selectedFilter.sizes.map((item, index) => {
              return <div key={index}>{item} </div>;
            })}{" "}
            {selectedFilter.color.length > 0 ? (
              <div>{selectedFilter.color} </div>
            ) : (
              " "
            )}
          </div>
          {(selectedFilter.color.length > 0 ||
            Object.keys(selectedFilter.category).length > 0 ||
            selectedFilter.sizes.length > 0) && (
            <div
              className={styles.delete_filter}
              onClick={() => handleDeleteFilter()}
            >
              Xóa lọc
            </div>
          )}
        </div>
        <div className={styles.dropdown}>
          <p>Sắp xếp theo</p>
          <button
            className={styles.dropdownBtn}
            onClick={() => setIsOpen(!isOpen)}
          >
            {selected} <i className="fa fa-chevron-down" />{" "}
          </button>

          {isOpen && (
            <div className={styles.dropdownMenu}>
              {options.map((option, index) => (
                <p
                  key={index}
                  onClick={() => {
                    setSelected(option);
                    setIsOpen(false);
                  }}
                  className={styles.dropdownItem}
                >
                  {option}
                </p>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Danh sách sản phẩm */}
      {isLoading ? (
        <Loader />
      ) : (
        <div className={styles.productList}>
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
      <div className={styles.line} />
      <div className={styles.container_more}>
        <div className={styles.btn_more} onClick={() => handleSeeMore()}>
          XEM THÊM
        </div>
        {products.length > 0 ? (
          <div>
            Hiển thị 1-{getTotalToShow(totalProduct.totalPages)} trên{" "}
            {totalProduct.totalDocs} sản phẩm
          </div>
        ) : (
          <div>Không tìm thấy sản phẩm phù hợp</div>
        )}
      </div>
    </div>
  );
};

export default ProductList;
