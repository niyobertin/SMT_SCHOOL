import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import api from '../../api/api';

export interface QuestionOption {
  id: string;
  option: string;
  order: number;
  isCorrect: boolean;
}

export interface Question {
  id: string;
  question: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay';
  points: number;
  options: QuestionOption[];
  explanation?: string;
  image?: string;
  order: number;
  testId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Test {
  id: string;
  title?: string;
  type: string;
  description: string;
  instructions: string[];
  duration: number; // in minutes
  passingScore: number;
  maxAttempts: number;
  isActive: boolean;
  showResults: boolean;
  randomizeQuestions: boolean;
  createdAt: string;
  updatedAt: string;
  courseId: string;
  questions: Question[];
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface TestState {
  tests: Test[];
  questions: Question[];
  currentTest: Test | null;
  loading: boolean;
  error: string | null;
  pagination: Pagination | null;
  isSubmitting: boolean;
}

const initialState: TestState = {
  tests: [],
  questions: [],
  currentTest: null,
  loading: false,
  error: null,
  pagination: null,
  isSubmitting: false,
};

// Async thunks
export const fetchTests = createAsyncThunk(
  'tests/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/tests');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch tests');
    }
  }
);

export const fetchTestById = createAsyncThunk(
  'tests/fetchById',
  async (testId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/tests/${testId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch test');
    }
  }
);

export const createTest = createAsyncThunk(
  'tests/create',
  async ({ testData, courseId }: { testData: Test, courseId: string }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/tests/${courseId}/tests`, testData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create test');
    }
  }
);

export const updateTest = createAsyncThunk(
  'tests/update',
  async ({ testData, id }: { testData: any, id: string }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/tests/${id}`, testData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update test');
    }
  }
);

export const deleteTest = createAsyncThunk(
  'tests/delete',
  async (testId: string, { rejectWithValue }) => {
    try {
      await api.delete(`/tests/${testId}`);
      return testId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete test');
    }
  }
);

export const addQuestion = createAsyncThunk(
  'tests/addQuestion',
  async ({ questionData, testId }: { questionData: any, testId: string }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/tests/${testId}/questions`, questionData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add question');
    }
  }
);

export const updateQuestion = createAsyncThunk(
  'tests/updateQuestion',
  async ({ questionData, id }: { questionData: any, id: string }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/tests/questions/${id}`, questionData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update question');
    }
  }
);

export const fetchQuestionsByTestId = createAsyncThunk(
  'tests/fetchQuestionsByTestId',
  async (testId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/tests/${testId}/questions`);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch questions');
    }
  }
);

export const deleteQuestion = createAsyncThunk(
  'tests/deleteQuestion',
  async (questionId: string, { rejectWithValue }) => {
    try {
      await api.delete(`/tests/questions/${questionId}`);
      return questionId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete question');
    }
  }
);

const testSlice = createSlice({
  name: 'tests',
  initialState,
  reducers: {
    resetTestState: () => initialState,
    setCurrentTest: (state, action: PayloadAction<Test | null>) => {
      state.currentTest = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch Tests
    builder.addCase(fetchTests.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchTests.fulfilled, (state, action) => {
      state.loading = false;
      state.tests = action.payload.data || [];
      state.pagination = action.payload.pagination || null;
    });
    builder.addCase(fetchTests.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch Test By ID
    builder.addCase(fetchTestById.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchTestById.fulfilled, (state, action) => {
      state.loading = false;
      state.currentTest = action.payload;
    });
    builder.addCase(fetchTestById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Create Test
    builder.addCase(createTest.pending, (state) => {
      state.isSubmitting = true;
      state.error = null;
    });
    builder.addCase(createTest.fulfilled, (state, action) => {
      state.isSubmitting = false;
      state.tests.push(action.payload);
      state.currentTest = action.payload;
    });
    builder.addCase(createTest.rejected, (state, action) => {
      state.isSubmitting = false;
      state.error = action.payload as string;
    });

    // Update Test
    builder.addCase(updateTest.pending, (state) => {
      state.isSubmitting = true;
      state.error = null;
    });
    builder.addCase(updateTest.fulfilled, (state, action) => {
      state.isSubmitting = false;
      const index = state.tests.findIndex(test => test.id === action.payload.id);
      if (index !== -1) {
        state.tests[index] = action.payload;
      }
      if (state.currentTest?.id === action.payload.id) {
        state.currentTest = action.payload;
      }
    });
    builder.addCase(updateTest.rejected, (state, action) => {
      state.isSubmitting = false;
      state.error = action.payload as string;
    });

    // Delete Test
    builder.addCase(deleteTest.fulfilled, (state, action) => {
      state.tests = state.tests.filter(test => test.id !== action.payload);
      if (state.currentTest?.id === action.payload) {
        state.currentTest = null;
      }
    });

    // Add Question
    builder.addCase(addQuestion.fulfilled, (state) => {
      // Questions are re-fetched via fetchQuestionsByTestId after add
    });

    // Update Question
    builder.addCase(updateQuestion.fulfilled, (state) => {
      // Questions are re-fetched via fetchQuestionsByTestId after update
    });

    // Fetch Questions By Test ID
    builder.addCase(fetchQuestionsByTestId.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchQuestionsByTestId.fulfilled, (state, action) => {
      state.loading = false;
      state.currentTest = action.payload;
      state.questions = action.payload || [];
    });
    builder.addCase(fetchQuestionsByTestId.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { resetTestState, setCurrentTest } = testSlice.actions;
export default testSlice.reducer;
