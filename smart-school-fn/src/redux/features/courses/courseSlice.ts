import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { RootState } from '../../stores';
import api from '../../api/api';

interface Course {
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
  instructor: {
    id: string;
    username: string;
    avatar: string;
    role: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string | null;
  };
  category: {
    id: string;
    name: string;
    description: string;
    slug: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
  lessons: any[];
  enrollments: any[];
  reviews: any[];
  tests: any[];
  certificates: any[];
}

interface CoursesState {
  items: Course[];
  loading: boolean;
  error: string | null;
  q: string;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  categoryFilter: string | null;
}

const initialState: CoursesState = {
  items: [],
  loading: false,
  error: null,
  q: '',
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 1,
  categoryFilter: null,
};

export const fetchCourses = createAsyncThunk(
  'courses/fetchCourses',
  async ({ page = 1, q = '', limit = 10, categoryId = null }: { page?: number; q?: string; limit?: number; categoryId?: string | null }) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(q && { q }),
      ...(categoryId && { categoryId }),
    });

    const response = await api.get(`/courses?${params}`);    
    return response.data;
  }
);

const coursesSlice = createSlice({
  name: 'courses',
  initialState,
  reducers: {
    setSearch: (state, action) => {
      state.q = action.payload;
      state.page = 1; 
    },
    setPage: (state, action) => {
      state.page = action.payload;
    },
    setCategoryFilter: (state, action) => {
      state.categoryFilter = action.payload;
      state.page = 1; 
    },
    clearFilters: (state) => {
      state.q = '';
      state.categoryFilter = null;
      state.page = 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCourses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCourses.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data.courses;
        state.total = action.payload.data.pagination.total;
        state.totalPages = action.payload.data.pagination.totalPages;
      })
      .addCase(fetchCourses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch courses';
      });
  },
});

export const { setSearch, setPage, setCategoryFilter, clearFilters } = coursesSlice.actions;

export const selectCourses = (state: RootState) => state.courses;

export default coursesSlice.reducer;
