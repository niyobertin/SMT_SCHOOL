import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth";
import categoriesReducer from "../features/courses/category";
import coursesReducer from "../features/courses/courseSlice";
import lessonsReducer from "../features/lessons/lessonSlice";
import lessonContentReducer from "../features/lessons/lessonContentSlice";
import testReducer from "../features/test/testSlice";
import manageTestReducer from "../features/test/manageTestslice";
import examPortalReducer from "../features/examPortalSlice";
import examAdminReducer from "../features/examAdminSlice";
import studentAuthReducer from "../features/studentAuth";
import academicReducer from "../features/academic/academicSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    categories: categoriesReducer,
    courses: coursesReducer,
    lessons: lessonsReducer,
    lessonContent: lessonContentReducer,
    test: testReducer,
    manageTest: manageTestReducer,
    examPortal: examPortalReducer,
    examAdmin: examAdminReducer,
    studentAuth: studentAuthReducer,
    academic: academicReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: process.env.NODE_ENV === 'production' ? {
        ignoredActionPaths: ["payload.error"],
        ignoredPaths: ["auth.error"],
      } : false,
    }),
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
