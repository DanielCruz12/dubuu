// redux/slices/exchange/currency-slice.ts

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface CurrencyState {
  currencyCode: string;
}

export const initialCurrencyState: CurrencyState = {
  currencyCode: "USD",
};

const currencySlice = createSlice({
  name: "currency",
  initialState: initialCurrencyState,
  reducers: {
    setCurrencyCode: (state, action: PayloadAction<string>) => {
      state.currencyCode = action.payload;
    },
  },
});

export const { setCurrencyCode } = currencySlice.actions;
export default currencySlice.reducer;
