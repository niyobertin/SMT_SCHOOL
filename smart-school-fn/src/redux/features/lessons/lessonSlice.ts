import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/api";

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
    type: string;
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
  async ({ courseId, page, limit }: { courseId: string; page: number; limit: number }) => {
    const response = await api.get(`/lessons/${courseId}`, { params: { page, limit } });
    return response.data.data;
  }
);


export const createLesson = createAsyncThunk(
  'lessons/createLesson',
  async (lessonData: any, { rejectWithValue }) => {
    try {
      const response = await api.post(`/lessons/${lessonData.courseId}`, lessonData);
      return response.data.data;
    } catch (error: any) {
      if (error.response) {
        return rejectWithValue(error.response.data.message || 'Failed to create lesson');
      }
      return rejectWithValue('Network error occurred');
    }
  }
);

export const updateLesson = createAsyncThunk(
  'lessons/updateLesson',
  async (lessonData: any, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/lessons/${lessonData.id}`, lessonData);
      return response.data.data;
    } catch (error: any) {
      if (error.response) {
        return rejectWithValue(error.response.data.message || 'Failed to update lesson');
      }
      return rejectWithValue('Network error occurred');
    }
  }
);


export const deleteLesson = createAsyncThunk(
  'lessons/deleteLesson',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/lessons/${id}`);
      return response.data.data;
    } catch (error: any) {
      if (error.response) {
        return rejectWithValue(error.response.data.message || 'Failed to delete lesson');
      }
      return rejectWithValue('Network error occurred');
    }
  }
);

const lessonSlice = createSlice({
  name: 'lessons',
  initialState,
  reducers: {
    setPage: (state, action) => {
      state.pagination = { ...state.pagination, page: action.payload };
    },
    setLimit: (state, action) => {
      state.pagination = { ...state.pagination, limit: action.payload };
    },

    clearLessons: (state) => {
      state.items = [];
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
      })

      .addCase(updateLesson.fulfilled, (state, action) => {
        state.items = state.items.map((lesson) => (lesson.id === action.payload.id ? action.payload : lesson));
      })
      .addCase(deleteLesson.fulfilled, (state, action) => {
        state.items = state.items.filter((lesson) => lesson.id !== action.payload);
      })
  },
});

export const { setPage, setLimit, clearLessons } = lessonSlice.actions;
export default lessonSlice.reducer;
