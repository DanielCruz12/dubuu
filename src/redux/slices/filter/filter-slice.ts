import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface FiltersState {
  rating: string;
  pricing: number;
  productType: string;
}

export const initialFilterState: FiltersState = {
  rating: "2",
  pricing: 100,
  productType: "tours",
};

const filtersSlice = createSlice({
  name: "filters",
  initialState: initialFilterState,
  reducers: {
    setRating: (state, action: PayloadAction<string>) => {
      state.rating = action.payload;
    },
    setPricing: (state, action: PayloadAction<number>) => {
      state.pricing = action.payload;
    },
    setProductType: (state, action: PayloadAction<string>) => {
      state.productType = action.payload;
    },
    resetFilters: () => initialFilterState,
  },
});

export const { setRating, resetFilters, setPricing, setProductType } =
  filtersSlice.actions;
export default filtersSlice.reducer;
