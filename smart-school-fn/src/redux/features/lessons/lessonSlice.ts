import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/api";
import type { RootState } from "../../stores";

interface Content {
  id: string;
  title: string;
  textBody: string;
  videoUrl: string | null;
  audioUrl: string | null;
  pdfUrl: string | null;
  imageUrl: string | null;
  fileName: string | null;
  order: number;
  createdAt: string;
  updatedAt: string;
  lessonId: string;
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  order: number;
  isPreview: boolean;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  courseId: string;
  content: Content[];
  userProgress: any[];
  course: {
    duration: string;
    id: string;
    title: string;
    slug: string;
    description: string;
    shortDescription: string;
    thumbnail: string;
    language: string;
    level: string;
    status: string;
    isPublished: boolean;
    isFeatured: boolean;
    tags: string[];
    requirements: string[];
    objectives: string[];
    createdAt: string;
    updatedAt: string;
    publishedAt: string | null;
    instructorId: string;
    categoryId: string;
  };
}

interface LessonsState {
  items: Lesson[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const initialState: LessonsState = {
  items: [],
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  },
};

export const fetchLessons = createAsyncThunk(
  'lessons/fetchLessons',
  async (courseId: string, { getState }) => {
    const state = getState() as RootState;
    const { page, limit } = state.lessons.pagination;
    
    const response = await api.get(`/lessons/${courseId}`, {
      params: { page, limit }
    });
    
    return response.data.data;
  }
);

const lessonSlice = createSlice({
  name: 'lessons',
  initialState,
  reducers: {
    setPage: (state, action) => {
      state.pagination.page = action.payload;
    },
    setLimit: (state, action) => {
      state.pagination.limit = action.payload;
    },
    clearLessons: (state) => {
      state.items = [];
      state.pagination.page = 1;
      state.pagination.total = 0;
      state.pagination.totalPages = 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLessons.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLessons.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.lessons;
        state.pagination = {
          ...state.pagination,
          total: action.payload.pagination.total,
          totalPages: action.payload.pagination.totalPages,
        };
      })
      .addCase(fetchLessons.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch lessons';
      });
  },
});

export const { setPage, setLimit, clearLessons } = lessonSlice.actions;
export default lessonSlice.reducer;
