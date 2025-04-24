import React, { createContext, useState } from "react";

export const FilterContext = createContext();

export const FilterProvider = ({ children }) => {
  const [selectedFilter, setSelectedFilter] = useState({
    category: {},
    sizes: [],
    color: "",
    price: { min: 0, max: 10000000 }, // Giá mặc định từ 0 đến 10 triệu VND
    sortBy: "createdAt",
    sortOrder: "desc",
    isFeatured: null,
  });

  const resetFilters = () => {
    setSelectedFilter({
      category: null,
      sizes: [],
      color: "",
      price: { min: 0, max: 10000000 },
      sortBy: "createdAt",
      sortOrder: "desc",
      isFeatured: null,
    });
  };

  return (
    <FilterContext.Provider
      value={{
        selectedFilter,
        setSelectedFilter,
        resetFilters,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
};
