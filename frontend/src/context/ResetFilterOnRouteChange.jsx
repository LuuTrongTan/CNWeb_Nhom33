// components/ResetFilterOnRouteChange.js
import { useEffect, useContext } from "react";
import { useLocation } from "react-router-dom";
import { FilterContext } from "./FilterContext";
const ResetFilterOnRouteChange = () => {
  const location = useLocation();
  const { resetFilters } = useContext(FilterContext);

  useEffect(() => {
    resetFilters();
  }, [location.pathname]);

  return null;
};

export default ResetFilterOnRouteChange;
