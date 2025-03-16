import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface FiltersState {
  rating: string;
  pricing: number;
}

const initialState: FiltersState = {
  rating: "3",
  pricing: 450,
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
    resetFilters: () => initialState, // ✅ Resetea el filtro
  },
});

export const { setRating, resetFilters, setPricing } = filtersSlice.actions;
export default filtersSlice.reducer;
