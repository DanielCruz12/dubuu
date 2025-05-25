import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface SearchState {
  searchTerm: string;
  country: string | null;
  categories: string[];
  durations: string[];
  priceRange: [number, number];
  minPrice?: number;
  maxPrice?: number;
  isLocationEnabled: boolean;
}

export const initialSearchState: SearchState = {
  searchTerm: "",
  country: null,
  categories: [],
  durations: [],
  priceRange: [0, 1000],
  minPrice: undefined,
  maxPrice: undefined,
  isLocationEnabled: false,
};

const searchSlice = createSlice({
  name: "search",
  initialState: initialSearchState,
  reducers: {
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
    },
    setCountry: (state, action: PayloadAction<string | null>) => {
      state.country = action.payload;
    },
    setCategories: (state, action: PayloadAction<string[]>) => {
      state.categories = action.payload;
    },
    setDurations: (state, action: PayloadAction<string[]>) => {
      state.durations = action.payload;
    },
    setPriceRange: (state, action: PayloadAction<[number, number]>) => {
      state.priceRange = action.payload;
      state.minPrice = action.payload[0] > 0 ? action.payload[0] : undefined;
      state.maxPrice = action.payload[1] < 1000 ? action.payload[1] : undefined;
    },
    setLocationEnabled: (state, action: PayloadAction<boolean>) => {
      state.isLocationEnabled = action.payload;
    },
    resetSearch: () => initialSearchState,
  },
});

export const {
  setSearchTerm,
  setCountry,
  setCategories,
  setDurations,
  setPriceRange,
  setLocationEnabled,
  resetSearch,
} = searchSlice.actions;

export default searchSlice.reducer;
