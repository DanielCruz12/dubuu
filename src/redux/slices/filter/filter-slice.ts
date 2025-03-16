import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface FiltersState {
  rating: string;
}

const initialState: FiltersState = {
  rating: "3",
};

const filtersSlice = createSlice({
  name: "filters",
  initialState,
  reducers: {
    setRating: (state, action: PayloadAction<string>) => {
      state.rating = action.payload;
    },
    resetFilters: () => initialState, // ✅ Resetea el filtro
  },
});

export const { setRating, resetFilters } = filtersSlice.actions;
export default filtersSlice.reducer;
