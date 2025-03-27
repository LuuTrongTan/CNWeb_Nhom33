import ProductCard from "./ProductCard";
import styles from "./styles/ProductList.module.scss";
import { useState, useContext, useEffect } from "react";
import { FilterContext } from "../context/FilterContext";

const products = [
  {
    id: 1,
    name: "Quần dài nam thể thao",
    price: "289.000",
    image: "link_image_1.jpg",
  },
  {
    id: 2,
    name: "Combo 3 quần đùi nam",
    price: "357.000",
    image: "link_image_2.jpg",
  },
  { id: 3, name: "Áo nỉ", price: "379.000", image: "link_image_3.jpg" },
  {
    id: 4,
    name: "Quần dài nam thể thao",
    price: "289.000",
    image: "link_image_1.jpg",
  },
  {
    id: 5,
    name: "Combo 3 quần đùi nam",
    price: "357.000",
    image: "link_image_2.jpg",
  },
  { id: 6, name: "Áo nỉ", price: "379.000", image: "link_image_3.jpg" },
  {
    id: 7,
    name: "Quần dài nam thể thao",
    price: "289.000",
    image: "link_image_1.jpg",
  },
  {
    id: 8,
    name: "Combo 3 quần đùi nam",
    price: "357.000",
    image: "link_image_2.jpg",
  },
  { id: 9, name: "Áo nỉ", price: "379.000", image: "link_image_3.jpg" },
  {
    id: 10,
    name: "Quần dài nam thể thao",
    price: "289.000",
    image: "link_image_1.jpg",
  },
  {
    id: 11,
    name: "Combo 3 quần đùi nam",
    price: "357.000",
    image: "link_image_2.jpg",
  },
  { id: 12, name: "Áo nỉ", price: "379.000", image: "link_image_3.jpg" },
];

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

  const handleDeleteFilter = () => {
    setSelectedFilter({
      sizes: [],
      color: "",
      product: "",
    });
  };

  useEffect(() => {
    console.log("Filter selected:", selectedFilter);
  }, [selectedFilter]);

  return (
    <div className={styles.container}>
      <div className={styles.nav_home}>
        <span>Trang chủ</span> / <span>100 kết quả</span>
      </div>
      <div className={styles.category}>QUẦN ÁO</div>
      <div className={styles.line} />
      <div className={styles.filter}>
        <div className={styles.quantity}>
          100 Kết quả
          <div className={styles.filters_result}>
            {selectedFilter.product.length > 0 ? (
              <div>{selectedFilter.product} </div>
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
            selectedFilter.product.length > 0 ||
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
      <div className={styles.productList}>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      <div className={styles.line} />
      <div className={styles.container_more}>
        <div className={styles.btn_more}>XEM THÊM</div>
        <div>Hiển thị 1-12 trên 200 sản phẩm</div>
      </div>
    </div>
  );
};

export default ProductList;
