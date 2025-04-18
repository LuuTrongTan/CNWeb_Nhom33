import React, { createContext, useState } from 'react';

export const FilterContext = createContext();

export const FilterProvider = ({ children }) => {
  const [selectedFilter, setSelectedFilter] = useState({
    category: null,
    sizes: [],
    color: '',
    price: { min: 0, max: 10000000 }, // Giá mặc định từ 0 đến 10 triệu VND
  });

  const resetFilters = () => {
    setSelectedFilter({
      category: null,
      sizes: [],
      color: '',
      price: { min: 0, max: 10000000 },
    });
  };

  const addSizeFilter = (size) => {
    setSelectedFilter(prev => {
      if (prev.sizes.includes(size)) {
        return {
          ...prev,
          sizes: prev.sizes.filter(s => s !== size)
        };
      } else {
        return {
          ...prev,
          sizes: [...prev.sizes, size]
        };
      }
    });
  };

  const setCategoryFilter = (category) => {
    setSelectedFilter(prev => ({
      ...prev,
      category
    }));
  };

  const setColorFilter = (color) => {
    setSelectedFilter(prev => ({
      ...prev,
      color
    }));
  };

  const setPriceFilter = (min, max) => {
    setSelectedFilter(prev => ({
      ...prev,
      price: { min, max }
    }));
  };

  return (
    <FilterContext.Provider
      value={{
        selectedFilter,
        setSelectedFilter,
        resetFilters,
        addSizeFilter,
        setCategoryFilter,
        setColorFilter,
        setPriceFilter
      }}
    >
      {children}
    </FilterContext.Provider>
  );
};
