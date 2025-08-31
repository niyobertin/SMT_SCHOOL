import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth";
import categoriesReducer from "../features/courses/category";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    categories: categoriesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActionPaths: ["payload.error"],
        ignoredPaths: ["auth.error"],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
