import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Category, FilterOptions } from "@/types/filters";

interface FiltersState {
  selectedCategory: Category;
  filters: FilterOptions;
}

const initialState: FiltersState = {
  selectedCategory: Category.TOURS,
  filters: {
    category: Category.TOURS,
    duration: null,
    rating: null,
    price: null,
  },
};

const filtersSlice = createSlice({
  name: "filters",
  initialState,
  reducers: {
    setCategory: (state, action: PayloadAction<Category>) => {
      state.selectedCategory = action.payload;
      state.filters.category = action.payload;
    },
    setFilters: (state, action: PayloadAction<Partial<FilterOptions>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
  },
});

export const { setCategory, setFilters } = filtersSlice.actions;
export default filtersSlice.reducer;
