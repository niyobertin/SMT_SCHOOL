import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/api';

interface Category {
  id: string;
  name: string;
  description: string;
  courses: string[];
  slug: string;
}

interface CategoryState {
  items: Category[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  search: string;
  loading: boolean;
  error: string | null;
}

const initialState: CategoryState = {
  items: [],
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 0,
  search: '',
  loading: false,
  error: null,
};

export const fetchCategories = createAsyncThunk(
  'courses/fetchCourses',
  async ({
    page = 1,
    limit = 10,
    search = '',
  }: { page?: number; limit?: number; search?: string }) => {
    const response = await api.get(
      `/categories?page=${page}&limit=${limit}${search ? `&q=${encodeURIComponent(search)}` : ''}`
    );
    return response.data;
  }
);

const categoriesSlice = createSlice({
  name: 'courses',
  initialState,
  reducers: {
    setSearch: (state, action) => {
      state.search = action.payload;
      state.page = 1; 
    },
    setPage: (state, action) => {
      state.page = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data?.categories || [];
        state.total = action.payload.data?.pagination?.total || 0;
        state.page = action.payload.data?.pagination?.page || 1;
        state.limit = action.payload.data?.pagination?.limit || 10;
        state.totalPages = action.payload.data?.pagination?.totalPages || 1;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch categories';
      });
  },
});

export const { setSearch, setPage } = categoriesSlice.actions;
export default categoriesSlice.reducer;
