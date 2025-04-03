import Sidebar from "../../components/Sidebar";
import ProductList from "../../components/ProductList";
import styles from "../styles/productListStyle/ProductListScreen.module.scss";
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
