import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface SearchState {
  searchTerm: string;
  country: {
    code: string;
    name: string;
  };
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
    code: "SV", // Código de país por defecto
    name: "El Salvador", // Nombre del país por defecto
  },
  categories: [],
  durations: [],
  priceRange: [0, 1000],
  isLocationEnabled: false,
  // Valores iniciales de los nuevos campos
  rating: "2",
  productType: "tours",
};

const searchSlice = createSlice({
  name: "search",
  initialState: initialSearchState,
  reducers: {
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
    },
    setCountry: (
      state,
      action: PayloadAction<{ code: string; name: string }>
    ) => {
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
    // Nuevos reducers agregados del filtersSlice
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
