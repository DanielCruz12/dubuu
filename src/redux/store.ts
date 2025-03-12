"use client";
import { useDispatch } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { productsApiSlice } from "./slices/product-slice";

export const store = configureStore({
  reducer: {
    [productsApiSlice.reducerPath]: productsApiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) => {
    return getDefaultMiddleware().concat(productsApiSlice.middleware);
  },
});

/* 📌 Tipos para TypeScript */
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();

