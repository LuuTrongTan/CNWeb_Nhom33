import React from "react";
import styles from "./styles/Loader.module.scss";

const Loader = () => {
  return (
    <div className={styles.loader}>
      <div className={styles.spinner}></div>
      <p>Đang tải sản phẩm...</p>
    </div>
  );
};

export default Loader;
