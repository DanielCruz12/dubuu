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
import { paymentAccountApiSlice } from "@/redux/slices/payment/payment-account";
import { reviewsApiSlice } from "@/redux/slices/product/review-slice";
import { productTypesApiSlice } from "@/redux/slices/product/product-types";
import { bookingsApiSlice } from "@/redux/slices/booking/booking-slice";
import { usersApiSlice } from "@/redux/slices/user/user-slice";
import { favoritesApiSlice } from "@/redux/slices/favorite/favorite-slice";
import { contactsApiSlice } from "@/redux/slices/contact/contact-slice";
import { productCategoriesApiSlice } from "@/redux/slices/product/product-category";
import { productAmenitiesApiSlice } from "@/redux/slices/product/product-amenity";
import { productAudiencesApiSlice } from "@/redux/slices/product/product-audience";
import searchReducer from "@/redux/slices/product/search/search-slice";
import { hostProfileApiSlice } from "@/redux/slices/host/host-profile-slice";

import authReducer from "./slices/auth/auth-slice";
import { panelApiSlice } from "./slices/panel/panel-slice";
import { blogsApiSlice } from "./slices/blog/blog-slice";

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
  whitelist: [
    "filters",
    "auth",
    "search",
    "paymentAccountApiSlice",
    "payments",
    "favoritesApiSlice",
    "productCategories",
    "productAmenities",
    "productAudiences",
    // Aquí puedes indicar qué reducers deseas persistir
    // "productsApiSlice", // Si deseas persistir el slice de productos
    // "paymentApiSlice", // Si deseas persistir el slice de pagos
    // "paymentAccountApiSlice", // Si deseas persistir el slice de cuentas de pago
    // "reviewsApiSlice", // Si deseas persistir el slice de reseñas
    // "productTypesApiSlice", // Si deseas persistir el slice de tipos de productos
    // "bookingsApiSlice", // Si deseas persistir el slice de reservas
    // "usersApiSlice", // Si deseas persistir el slice de usuarios
  ], // Aquí puedes indicar qué reducers deseas persistir
};

const rootReducer = combineReducers({
  //global: globalReducer,
  [productsApiSlice.reducerPath]: productsApiSlice.reducer,
  [paymentApiSlice.reducerPath]: paymentApiSlice.reducer,
  [paymentAccountApiSlice.reducerPath]: paymentAccountApiSlice.reducer,
  [reviewsApiSlice.reducerPath]: reviewsApiSlice.reducer,
  [productTypesApiSlice.reducerPath]: productTypesApiSlice.reducer,
  [bookingsApiSlice.reducerPath]: bookingsApiSlice.reducer,
  [favoritesApiSlice.reducerPath]: favoritesApiSlice.reducer,
  [usersApiSlice.reducerPath]: usersApiSlice.reducer,
  [contactsApiSlice.reducerPath]: contactsApiSlice.reducer,
  [productCategoriesApiSlice.reducerPath]: productCategoriesApiSlice.reducer,
  [productAmenitiesApiSlice.reducerPath]: productAmenitiesApiSlice.reducer,
  [productAudiencesApiSlice.reducerPath]: productAudiencesApiSlice.reducer,
  [panelApiSlice.reducerPath]: panelApiSlice.reducer,
  [hostProfileApiSlice.reducerPath]: hostProfileApiSlice.reducer,
  [blogsApiSlice.reducerPath]: blogsApiSlice.reducer,
  auth: authReducer,
  search: searchReducer,
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
        paymentAccountApiSlice.middleware,
        productTypesApiSlice.middleware,
        bookingsApiSlice.middleware,
        favoritesApiSlice.middleware,
        usersApiSlice.middleware,
        contactsApiSlice.middleware,
        productCategoriesApiSlice.middleware,
        productAmenitiesApiSlice.middleware,
        productAudiencesApiSlice.middleware,
        panelApiSlice.middleware,
        hostProfileApiSlice.middleware,
        blogsApiSlice.middleware,
      ),
  });

/* Tipos de Redux */
export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

/** Limpia el caché de todos los API slices (para refetch con el nuevo ?locale= al cambiar idioma). */
export function invalidateApiCacheOnLocaleChange() {
  return (dispatch: AppDispatch) => {
    [
      productsApiSlice,
      productCategoriesApiSlice,
      productAmenitiesApiSlice,
      productAudiencesApiSlice,
      productTypesApiSlice,
      reviewsApiSlice,
      bookingsApiSlice,
      favoritesApiSlice,
      panelApiSlice,
      contactsApiSlice,
      usersApiSlice,
      paymentApiSlice,
      paymentAccountApiSlice,
      hostProfileApiSlice,
      blogsApiSlice,
    ].forEach((slice) => {
      dispatch(slice.util.resetApiState());
    });
  };
}

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
