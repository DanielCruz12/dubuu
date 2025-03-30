import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface FiltersState {
  rating: string;
  pricing: number;
  category: string;
}

const initialState: FiltersState = {
  rating: "1",
  pricing: 10,
  category: "tours",
};

const filtersSlice = createSlice({
  name: "filters",
  initialState,
  reducers: {
    setRating: (state, action: PayloadAction<string>) => {
      state.rating = action.payload;
    },
    setPricing: (state, action: PayloadAction<number>) => {
      state.pricing = action.payload;
    },
    setCategory: (state, action: PayloadAction<string>) => {
      state.category = action.payload;
    },
    resetFilters: () => initialState, // ✅ Resetea el filtro
  },
});

export const { setRating, resetFilters, setPricing, setCategory } =
  filtersSlice.actions;
export default filtersSlice.reducer;
