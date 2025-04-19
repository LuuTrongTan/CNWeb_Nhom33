import Sidebar from "../../components/Layout/Sidebar";
import ProductList from "../../components/Product/ProductList";
import styles from "../../styles/scss/productListStyle/ProductListScreen.module.scss";
import { FilterProvider } from "../../context/FilterContext";

const Home = () => {
  return (
    <div>
      <div className={styles.container}>
        <FilterProvider>
          <Sidebar />
          <ProductList />
        </FilterProvider>
      </div>
    </div>
  );
};

export default Home;
