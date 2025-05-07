import { useEffect, useContext, useRef } from "react";
import { useLocation } from "react-router-dom";
import { FilterContext } from "./FilterContext";

const ResetFilterOnRouteChange = () => {
  const location = useLocation();
  const { resetFilters } = useContext(FilterContext);
  const prevPathRef = useRef(location.pathname);

  useEffect(() => {
    const prevPath = prevPathRef.current;
    const currPath = location.pathname;

    const isMongoId = (path) => /^\/products\/[a-f\d]{24}$/.test(path);
    const isSlug = (path) =>
      /^\/products\/[^/]+$/.test(path) && !isMongoId(path);

    const goingToProducts = currPath === "/products";

    if (goingToProducts) {
      if (isSlug(prevPath)) {
        console.log("Resetting filters from slug to /products");
        resetFilters();
      } else if (isMongoId(prevPath)) {
        console.log("No reset from Mongo ID to /products");
      } else {
        console.log("Resetting filters to /products from non-product detail");
        resetFilters();
      }
    } else if (currPath === "/") {
      // Don't reset on homepage
      resetFilters();
    } else {
      // All other transitions
      // resetFilters();
    }

    prevPathRef.current = currPath;
  }, [location.pathname]);

  return null;
};

export default ResetFilterOnRouteChange;
