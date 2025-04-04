/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useRef } from "react";
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import {
  Provider,
  TypedUseSelectorHook,
  useDispatch,
  useSelector,
} from "react-redux";
import { setupListeners } from "@reduxjs/toolkit/query";
import filtersReducer from "./slices/filter/filter-slice";

// Redux Persist
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import createWebStorage from "redux-persist/lib/storage/createWebStorage";

// Importa tus slices modularizados
import { productsApiSlice } from "@/redux/slices/product/product-slice";
import { paymentApiSlice } from "@/redux/slices/payment/payment-link";
import { reviewsApiSlice } from "@/redux/slices/product/review-slice";
import { productTypesApiSlice } from "@/redux/slices/product/product-types";
import { bookingsApiSlice } from "@/redux/slices/booking/booking-slice";

// Función para crear un almacenamiento "inerte" en entornos sin window (server-side)
const createNoopStorage = () => {
  return {
    getItem(_key: any) {
      return Promise.resolve(null);
    },
    setItem(_key: any, value: any) {
      return Promise.resolve(value);
    },
    removeItem(_key: any) {
      return Promise.resolve();
    },
  };
};

const storage =
  typeof window === "undefined"
    ? createNoopStorage()
    : createWebStorage("local");

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["filters"], // Aquí puedes indicar qué reducers deseas persistir
};

const rootReducer = combineReducers({
  //global: globalReducer,
  [productsApiSlice.reducerPath]: productsApiSlice.reducer,
  [paymentApiSlice.reducerPath]: paymentApiSlice.reducer,
  [reviewsApiSlice.reducerPath]: reviewsApiSlice.reducer,
  [productTypesApiSlice.reducerPath]: productTypesApiSlice.reducer,
  [bookingsApiSlice.reducerPath]: bookingsApiSlice.reducer,
  filters: filtersReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const makeStore = () =>
  configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          // Ignoramos estas acciones para evitar problemas con redux-persist
          ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        },
      }).concat(
        productsApiSlice.middleware,
        reviewsApiSlice.middleware,
        paymentApiSlice.middleware,
        productTypesApiSlice.middleware,
        bookingsApiSlice.middleware
      ),
  });

/* Tipos de Redux */
export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

/* Provider */
export default function StoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const storeRef = useRef<AppStore>();
  if (!storeRef.current) {
    storeRef.current = makeStore();
    setupListeners(storeRef.current.dispatch);
  }

  const persistor = persistStore(storeRef.current);

  return <Provider store={storeRef.current}>{children}</Provider>;
}
