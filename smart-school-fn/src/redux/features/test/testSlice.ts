import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import api from '../../api/api';

interface TestState {
  test: any | null;
  questions: any[];
  currentQuestionIndex: number;
  answers: { [key: number]: any };
  testAttempt: any | null;
  loading: boolean;
  error: string | null;
  timeRemaining: number;
  isSubmitting: boolean;
  results: any | null;
}

const initialState: TestState = {
  test: null,
  questions: [],
  currentQuestionIndex: 0,
  answers: {},
  testAttempt: null,
  loading: false,
  error: null,
  timeRemaining: 0,
  isSubmitting: false,
  results: null,
};

// Async thunks
export const fetchTestById = createAsyncThunk(
  'test/fetchTestById',
  async (testId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/tests/${testId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch test');
    }
  }
);

export const startTestAttempt = createAsyncThunk(
  'test/startTestAttempt',
  async (testId: string, { rejectWithValue }) => {
    try {
      const response = await api.post(`/tests/${testId}/start`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to start test attempt');
    }
  }
);

export const submitTestAnswer = createAsyncThunk(
  'test/submitAnswer',
  async (
    { attemptId, questionId, answer }: { attemptId: string; questionId: string; answer: any },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post(`/test-attempts/${attemptId}/answer`, {
        questionId,
        answer,
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to submit answer');
    }
  }
);

export const submitTestAttempt = createAsyncThunk(
  'test/submitTestAttempt',
  async (attemptId: string, { rejectWithValue }) => {
    try {
      const response = await api.post(`/test-attempts/${attemptId}/submit`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to submit test');
    }
  }
);

const testSlice = createSlice({
  name: 'test',
  initialState,
  reducers: {
    setCurrentQuestion: (state, action: PayloadAction<number>) => {
      state.currentQuestionIndex = action.payload;
    },
    saveAnswer: (state, action: PayloadAction<{ questionIndex: number; answer: any }>) => {
      const { questionIndex, answer } = action.payload;
      state.answers[questionIndex] = answer;
    },
    resetTest: () => initialState,
    updateTimeRemaining: (state, action: PayloadAction<number>) => {
      state.timeRemaining = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch Test
    builder.addCase(fetchTestById.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchTestById.fulfilled, (state, action) => {
      state.loading = false;
      state.test = action.payload;
      state.timeRemaining = action.payload.duration * 60; // Convert minutes to seconds
    });
    builder.addCase(fetchTestById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Start Test Attempt
    builder.addCase(startTestAttempt.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(startTestAttempt.fulfilled, (state, action) => {
      state.loading = false;
      state.testAttempt = action.payload;
      state.questions = action.payload.questions || [];
    });
    builder.addCase(startTestAttempt.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Submit Answer
    builder.addCase(submitTestAnswer.fulfilled, (state, action) => {
      // Update the answer in the state if needed
      const { questionId, answer } = action.meta.arg;
      const questionIndex = state.questions.findIndex((q) => q.id === questionId);
      if (questionIndex !== -1) {
        state.answers[questionIndex] = answer;
      }
    });

    // Submit Test Attempt
    builder.addCase(submitTestAttempt.pending, (state) => {
      state.isSubmitting = true;
      state.error = null;
    });
    builder.addCase(submitTestAttempt.fulfilled, (state, action) => {
      state.isSubmitting = false;
      state.results = action.payload;
      state.testAttempt = {
        ...state.testAttempt,
        status: 'COMPLETED',
        ...action.payload,
      };
    });
    builder.addCase(submitTestAttempt.rejected, (state, action) => {
      state.isSubmitting = false;
      state.error = action.payload as string;
    });
  },
});

export const { setCurrentQuestion, saveAnswer, resetTest, updateTimeRemaining } = testSlice.actions;

export default testSlice.reducer;
