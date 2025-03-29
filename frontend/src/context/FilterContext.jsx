import { createContext, useState } from "react";

export const FilterContext = createContext();

export const FilterProvider = ({ children }) => {
  const [selectedFilter, setSelectedFilter] = useState({
    sizes: [],
    color: "",
    category: {},
  });

  return (
    <FilterContext.Provider value={{ selectedFilter, setSelectedFilter }}>
      {children}
    </FilterContext.Provider>
  );
};
