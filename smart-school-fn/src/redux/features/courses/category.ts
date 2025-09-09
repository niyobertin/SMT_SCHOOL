import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/api';

export interface Category {
  id: string;
  name: string;
  description: string;
  slug: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  courses?: string[];
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
  createStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  createError: string | null;
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
  createStatus: 'idle',
  createError: null,
};

export const fetchCategories = createAsyncThunk(
  'categories/fetchCategories',
  async ({
    page = 1,
    limit = 100,
    search = '',
  }: { page?: number; limit?: number; search?: string } = {}) => {
    const response = await api.get(
      `/categories?page=${page}&limit=${limit}${search ? `&q=${encodeURIComponent(search)}` : ''}`
    );
    return response.data;
  }
);

export const createCategory = createAsyncThunk(
  'categories/createCategory',
  async (categoryData: Omit<Category, 'id' | 'createdAt' | 'updatedAt' | 'slug' | 'courses'>, { rejectWithValue }) => {
    try {
      const response = await api.post('/categories', categoryData);
      return response.data.data;
    } catch (error:any) {
      if (error.response) {
        return rejectWithValue(error.response.data.message || 'Failed to create category');
      }
      return rejectWithValue('Network error occurred');
    }
  }
);

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    setSearch: (state, action) => {
      state.search = action.payload;
      state.page = 1;
    },
    setPage: (state, action) => {
      state.page = action.payload;
    },
    resetCreateStatus: (state) => {
      state.createStatus = 'idle';
      state.createError = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Categories
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
      })
      // Create Category
      .addCase(createCategory.pending, (state) => {
        state.createStatus = 'loading';
        state.createError = null;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.createStatus = 'succeeded';
        state.items.unshift(action.payload);
        state.total += 1;
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.createStatus = 'failed';
        state.createError = action.payload as string;
      });
  },
});

export const { setSearch, setPage, resetCreateStatus } = categoriesSlice.actions;

export const selectCategories = (state: { categories: CategoryState }) => ({
  items: state.categories.items,
  loading: state.categories.loading,
  error: state.categories.error,
  createStatus: state.categories.createStatus,
  createError: state.categories.createError,
});

export default categoriesSlice.reducer;
