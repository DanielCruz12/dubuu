import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { DEFAULT_PRODUCT_TYPE_QUERY } from "@/constants/product-type";

export interface Country {
  code: string;
  name: string;
}

export interface SearchState {
  searchTerm: string;
  country: Country;
  categories: string[];
  durations: string[];
  priceRange: [number, number];
  isLocationEnabled: boolean;
  rating: string;
  productType: string;
}

export const initialSearchState: SearchState = {
  searchTerm: "",
  country: {
    code: "", // Código de país por defecto
    name: "", // Nombre del país por defecto
  },
  categories: [],
  durations: [],
  priceRange: [0, 1000],
  isLocationEnabled: false, // Cambiar a true por defecto
  // Cambiar rating inicial a "0" para no filtrar por defecto
  rating: "0",
  productType: DEFAULT_PRODUCT_TYPE_QUERY,
};

export const searchSlice = createSlice({
  name: "search",
  initialState: initialSearchState,
  reducers: {
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
    },
    setCountry: (state, action: PayloadAction<Country>) => {
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
    },
    setLocationEnabled: (state, action: PayloadAction<boolean>) => {
      state.isLocationEnabled = action.payload;
    },
    setRating: (state, action: PayloadAction<string>) => {
      state.rating = action.payload;
    },
    setProductType: (state, action: PayloadAction<string>) => {
      state.productType = action.payload;
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
  setRating,
  setProductType,
  resetSearch,
} = searchSlice.actions;

export default searchSlice.reducer;
