import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/api";

export interface Level {
  id: string;
  courseId: string;
  title: string;
  description: string | null;
  order: number;
  price: number;
  currency: string;
  isPublished: boolean;
  certificateEnabled: boolean;
  certificateTitle: string | null;
  certificateOrgName: string | null;
  certificateDescription: string | null;
  certificatePassingScoreOverride: number | null;
  certificateSignatureName: string | null;
  certificateSignatureImageUrl: string | null;
  certificateLogoUrl: string | null;
  test?: { id: string; title: string; passingScore: number } | null;
  access?: {
    isPaid: boolean;
    isSequentialOk: boolean;
    canAccess: boolean;
    reason: "not_paid" | "sequential_locked" | null;
  } | null;
}

export interface LevelProgressEntry {
  id: string;
  title: string;
  description: string | null;
  order: number;
  price: number;
  currency: string;
  certificateEnabled: boolean;
  access: {
    isPaid: boolean;
    isSequentialOk: boolean;
    canAccess: boolean;
    reason: "not_paid" | "sequential_locked" | null;
  };
  content: {
    totalLessons: number;
    completedLessons: number;
    percent: number;
    contentComplete: boolean;
  };
  exam: {
    testId: string;
    attemptsUsed: number;
    maxAttempts: number | null;
    bestScore: number | null;
    isPassed: boolean;
    passingScore: number;
  } | null;
  certificate: {
    issued: boolean;
    certificateId?: string;
    certificateNumber?: string;
    pdfUrl?: string | null;
    issuedAt?: string;
  };
}

export interface CourseLevelProgress {
  courseId: string;
  courseTitle: string;
  hasLevels: boolean;
  enforceSequentialLevels: boolean;
  levels: LevelProgressEntry[];
}

interface LevelState {
  items: Level[];
  progress: CourseLevelProgress | null;
  loading: boolean;
  progressLoading: boolean;
  error: string | null;
}

const initialState: LevelState = {
  items: [],
  progress: null,
  loading: false,
  progressLoading: false,
  error: null,
};

export const fetchLevelsByCourse = createAsyncThunk(
  "levels/fetchByCourse",
  async (courseId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/levels/course/${courseId}`);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch levels");
    }
  }
);

export const fetchCourseLevelProgress = createAsyncThunk(
  "levels/fetchProgress",
  async (courseId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/levels/course/${courseId}/progress`);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch level progress");
    }
  }
);

export const createLevel = createAsyncThunk(
  "levels/create",
  async ({ courseId, data }: { courseId: string; data: FormData | Record<string, any> }, { rejectWithValue }) => {
    try {
      const isFormData = data instanceof FormData;
      const response = await api.post(`/levels/course/${courseId}`, data, {
        headers: isFormData ? { "Content-Type": "multipart/form-data" } : undefined,
      });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to create level");
    }
  }
);

export const updateLevel = createAsyncThunk(
  "levels/update",
  async ({ levelId, data }: { levelId: string; data: FormData | Record<string, any> }, { rejectWithValue }) => {
    try {
      const isFormData = data instanceof FormData;
      const response = await api.patch(`/levels/${levelId}`, data, {
        headers: isFormData ? { "Content-Type": "multipart/form-data" } : undefined,
      });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to update level");
    }
  }
);

export const deleteLevel = createAsyncThunk(
  "levels/delete",
  async (levelId: string, { rejectWithValue }) => {
    try {
      await api.delete(`/levels/${levelId}`);
      return levelId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete level");
    }
  }
);

export const reorderLevels = createAsyncThunk(
  "levels/reorder",
  async (
    { courseId, order }: { courseId: string; order: Array<{ levelId: string; order: number }> },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.patch(`/levels/course/${courseId}/reorder`, { order });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to reorder levels");
    }
  }
);

export const unlockLevelForUser = createAsyncThunk(
  "levels/unlockForUser",
  async ({ levelId, userId, reason }: { levelId: string; userId: string; reason?: string }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/levels/${levelId}/unlock`, { userId, reason });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to unlock level");
    }
  }
);

const levelSlice = createSlice({
  name: "levels",
  initialState,
  reducers: {
    clearLevels: (state) => {
      state.items = [];
      state.progress = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLevelsByCourse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLevelsByCourse.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchLevelsByCourse.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to fetch levels";
      })

      .addCase(fetchCourseLevelProgress.pending, (state) => {
        state.progressLoading = true;
      })
      .addCase(fetchCourseLevelProgress.fulfilled, (state, action) => {
        state.progressLoading = false;
        state.progress = action.payload;
      })
      .addCase(fetchCourseLevelProgress.rejected, (state, action) => {
        state.progressLoading = false;
        state.error = (action.payload as string) || "Failed to fetch level progress";
      })

      .addCase(createLevel.fulfilled, (state, action) => {
        state.items = [...state.items, action.payload].sort((a, b) => a.order - b.order);
      })
      .addCase(updateLevel.fulfilled, (state, action) => {
        state.items = state.items.map((l) => (l.id === action.payload.id ? { ...l, ...action.payload } : l));
      })
      .addCase(deleteLevel.fulfilled, (state, action) => {
        state.items = state.items.filter((l) => l.id !== action.payload);
      })
      .addCase(reorderLevels.fulfilled, (state, action) => {
        state.items = action.payload;
      });
  },
});

export const { clearLevels } = levelSlice.actions;
export default levelSlice.reducer;
