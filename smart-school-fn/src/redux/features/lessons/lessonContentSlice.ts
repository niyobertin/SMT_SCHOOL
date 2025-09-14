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
  success: boolean;
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
  success: false,
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

export const createLessonContent = createAsyncThunk(
  'lessonContent/createLessonContent',
  async (lessonContent: FormData, { rejectWithValue }) => {
    try {
      console.log("This is the response", lessonContent);
      const lessonId = lessonContent.get('lessonId');
      lessonContent.delete('lessonId');
      const response = await api.post(`/lesson-content/${lessonId}`, lessonContent, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });


      return response.data.data;
    } catch (error: any) {
      if (error.response) {
        return rejectWithValue(error.response.data.message || 'Failed to create lesson content');
      }
      return rejectWithValue('Network error occurred');
    }
  }
);

export const updateLessonContent = createAsyncThunk(
  'lessonContent/updateLessonContent',
  async (contentData: FormData, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/lesson-content/${contentData.get('id')}`, contentData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.data;
    } catch (error: any) {
      if (error.response) {
        return rejectWithValue(error.response.data.message || 'Failed to update lesson content');
      }
      return rejectWithValue('Network error occurred');
    }
  }
);

export const deleteLessonContent = createAsyncThunk(
  'lessonContent/deleteLessonContent',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/lesson-content/${id}`);
      console.log("Lesson content deleted successfully", response);
      return response.data.data;
    } catch (error: any) {
      if (error.response) {
        return rejectWithValue(error.response.data.message || 'Failed to delete lesson content');
      }
      return rejectWithValue('Network error occurred');
    }
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
      state.success = false; // reset success
      state.loading = false; // reset loading
      state.error = null; // reset error
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch lesson content
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
        if (action.payload.lessonContent.length > 0 && !state.currentContent) {
          state.currentContent = action.payload.lessonContent[0];
        }
      })
      .addCase(fetchLessonContent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch lesson content';
      })

      // Create lesson content
      .addCase(createLessonContent.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(createLessonContent.fulfilled, (state, action) => {
        state.loading = false;
        state.items.push(action.payload); // add new content to items
        state.currentContent = action.payload; // set newly created as current
        state.success = true; // mark success
      })
      .addCase(createLessonContent.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Failed to create lesson content';
        state.success = false;
      })

      // Update lesson content
      .addCase(updateLessonContent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateLessonContent.fulfilled, (state, action) => {
        state.loading = false;
        const updatedContentIndex = state.items.findIndex((content) => content.id === action.payload.id);
        if (updatedContentIndex !== -1) {
          state.items[updatedContentIndex] = action.payload;
        }
        state.currentContent = action.payload; // update current content
        state.success = true; // mark success
      })
      .addCase(updateLessonContent.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Failed to update lesson content';
        state.success = false;
      })

      // Delete lesson content
      .addCase(deleteLessonContent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteLessonContent.fulfilled, (state, action) => {
        state.loading = false;
        const deletedContentIndex = state.items.findIndex((content) => content.id === action.payload);
        if (deletedContentIndex !== -1) {
          state.items.splice(deletedContentIndex, 1);
        }
        if (state.currentContent && state.currentContent.id === action.payload) {
          state.currentContent = null;
        }
        state.success = true; // mark success
      })
      .addCase(deleteLessonContent.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Failed to delete lesson content';
        state.success = false;
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
