import styles from "./styles/ProductCard.module.scss";

const ProductCard = ({ product }) => {
  const handleClick = () => {
    alert("click");
  };
  return (
    <div className={styles.card} onClick={() => handleClick()}>
      {/* <img src={product.image} alt={product.name} /> */}
      <div className={styles.img}></div>
      <div className={styles.info}>
        <h4>{product.name}</h4>
        <p>{product.price}đ</p>
      </div>
    </div>
  );
};

export default ProductCard;
