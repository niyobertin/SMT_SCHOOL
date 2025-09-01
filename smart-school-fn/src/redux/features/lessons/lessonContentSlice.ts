import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/api";
import type { RootState } from "../../stores";

interface LessonContent {
  id: string;
  title: string;
  textBody: string;
  videoUrl: string | null;
  audioUrl: string | null;
  pdfUrl: string | null;
  imageUrl: string | null;
  fileName: string | null;
  order: number;
  lesson: {
    course: {
      requirements: string[];
      objectives: string[];
    };
  };
  createdAt?: string;
}

interface LessonContentState {
  items: LessonContent[];
  loading: boolean;
  error: string | null;
  currentContent: LessonContent | null;
  showRequirements: boolean;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const initialState: LessonContentState = {
  items: [],
  loading: false,
  error: null,
  currentContent: null,
  showRequirements: true,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  },
};

export const fetchLessonContent = createAsyncThunk(
  'lessonContent/fetchLessonContent',
  async (lessonId: string, { getState }) => {
    const state = getState() as RootState;
    const { page, limit } = state.lessonContent.pagination;
    
    const response = await api.get(`/lesson-content/${lessonId}`, {
      params: { page, limit }
    });
    
    return response.data.data;
  }
);

const lessonContentSlice = createSlice({
  name: 'lessonContent',
  initialState,
  reducers: {
    setCurrentContent: (state, action) => {
      state.currentContent = action.payload;
    },
    toggleRequirements: (state) => {
      state.showRequirements = !state.showRequirements;
    },
    setPage: (state, action) => {
      state.pagination.page = action.payload;
    },
    clearLessonContent: (state) => {
      state.items = [];
      state.currentContent = null;
      state.showRequirements = true;
      state.pagination = {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 1,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLessonContent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLessonContent.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.lessonContent;
        state.pagination = {
          ...state.pagination,
          total: action.payload.pagination.total,
          totalPages: action.payload.pagination.totalPages,
        };
        // Set first content as current if none is set
        if (action.payload.lessonContent.length > 0 && !state.currentContent) {
          state.currentContent = action.payload.lessonContent[0];
        }
      })
      .addCase(fetchLessonContent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch lesson content';
      });
  },
});

export const { 
  setCurrentContent, 
  toggleRequirements, 
  setPage, 
  clearLessonContent 
} = lessonContentSlice.actions;

export default lessonContentSlice.reducer;
