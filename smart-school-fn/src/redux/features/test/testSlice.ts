import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import api from '../../api/api';

export interface Question {
  id: string;
  question: string;
  type: string;
  points: number;
  options: Array<{
    id: string;
    option: string;
    order: number;
  }>;
  order: number;
}

export interface Test {
  id: string;
  title: string;
  description: string;
  instructions: string[];
  duration: number;
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
  currentQuestionIndex: number;
  answers: { [key: string]: any }; // key is questionId
  testAttempt: any | null;
  loading: boolean;
  error: string | null;
  timeRemaining: number;
  isSubmitting: boolean;
  results: any | null;
  pagination: Pagination | null;
  test: any | null;
}

const initialState: TestState = {
  tests: [],
  questions: [],
  currentQuestionIndex: 0,
  answers: {},
  testAttempt: null,
  loading: false,
  error: null,
  timeRemaining: 0,
  isSubmitting: false,
  results: null,
  pagination: null,
  test: null,
};

// Async thunks
export const fetchTestById = createAsyncThunk(
  'test/fetchTestById',
  async (testId: string, { rejectWithValue }) => {
    try {
      if (!testId) {
        throw new Error('Test ID is required');
      }
      
      // Add logging to debug the request
      console.log('Fetching test with ID:', testId);
      
      const response = await api.get(`/tests/${testId}`);
      const responseData = response.data;
      
      // Handle different response structures
      const testData = responseData.data || responseData;
      
      if (!testData) {
        throw new Error('No test data received');
      }
      
      // Process the test data
      return {
        ...testData,
        timeRemaining: testData.duration ? testData.duration * 60 : 0,
        questions: Array.isArray(testData.questions) 
          ? testData.questions.map((q: any) => ({
              ...q,
              options: Array.isArray(q.options) 
                ? q.options.map((opt: any, i: number) => ({
                    id: opt.id || `opt-${i}`,
                    option: opt.text || opt,
                    order: i
                  }))
                : []
            }))
          : []
      };
      
    } catch (error: any) {
      console.error('Error in fetchTestById:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to fetch test',
        status: error.response?.status,
        details: error.response?.data
      });
    }
  }
);

export const startTest = createAsyncThunk(
  'test/startTest',
  async (testId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/tests/${testId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to start test');
    }
  }
);

export const startTestAttempt = createAsyncThunk(
  'test/startTestAttempt',
  async (testId: string, { rejectWithValue }) => {
    try {
      const response = await api.post(`/tests/${testId}/start`);
      const responseData = response.data.data || response.data;
    
      const processedQuestions = Array.isArray(responseData.questions) 
        ? responseData.questions.map((q: any) => ({
            ...q,
            options: Array.isArray(q.options)
              ? q.options.map((opt: any) => ({
                  id: opt.id || `opt-${Math.random().toString(36).substr(2, 9)}`,
                  option: opt.text || opt,
                  order: opt.order || 0
                }))
              : []
          }))
        : [];
      
      const testAttempt = {
        id: responseData.attemptId,
        startTime: responseData.startTime,
        endTime: responseData.endTime,
        test: responseData.test,
        questions: processedQuestions,
        timeRemaining: responseData.timeRemaining || 0
      }
      return testAttempt;
    } catch (error: any) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to start test attempt',
        status: error.response?.status
      });
    }
  }
);

export const submitTestAnswer = createAsyncThunk(
  'test/submitTestAnswer',
  async (
    { attemptId, questionId, answer }: { attemptId: string; questionId: string; answer: any },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.put(`/tests/test-attempts/${attemptId}/answers`, {
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
      const response = await api.post(`/tests/test-attempts/${attemptId}/submit`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to submit test');
    }
  }
);

export const fetchTestsByCourseId = createAsyncThunk(
  'test/fetchTestsByCourseId',
  async (courseId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/tests/${courseId}/tests`);
      return response.data.data; 
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch tests');
    }
  }
);

// Submit answer to a question
export const submitAnswer = createAsyncThunk(
  'test/submitAnswer',
  async (
    { attemptId, questionId, selectedOptions, answerText = '' }: 
    { attemptId: string; questionId: string; selectedOptions: string[]; answerText?: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.put(`/tests/test-attempts/${attemptId}/answer`, {
        questionId,
        answerText,
        selectedOptions
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to submit answer',
        details: error.response?.data
      });
    }
  }
);

// Submit the entire test
export const submitTest = createAsyncThunk(
  'test/submitTest',
  async (attemptId: string, { rejectWithValue }) => {
    try {
      const response = await api.post(`/tests/test-attempts/${attemptId}/submit`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to submit test',
        details: error.response?.data
      });
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
    saveAnswer: (state, action: PayloadAction<{ questionId: string; answer: any }>) => {
      const { questionId, answer } = action.payload;
      state.answers[questionId] = answer;
    },
    resetTest: () => {
      return { ...initialState };
    },
    updateTimeRemaining: (state, action: PayloadAction<number>) => {
      state.timeRemaining = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle fetchTestById
      .addCase(fetchTestById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTestById.fulfilled, (state, action) => {
        state.loading = false;
        state.tests = action.payload;
        // Ensure questions and options are properly structured
        state.questions = Array.isArray(action.payload.questions) 
          ? action.payload.questions.map((q: any) => ({
              ...q,
              options: Array.isArray(q.options) 
                ? q.options.map((opt: any) => ({
                    id: opt.id || `opt-${Math.random().toString(36).substr(2, 9)}`,
                    option: opt.text || opt,
                    order: opt.order || 0
                  }))
                : []
            }))
          : [];
      })
      .addCase(fetchTestById.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as any)?.message || 'Failed to load test';
      })
      
      // Handle startTest pending
      .addCase(startTest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      
      // Handle startTest fulfilled
      .addCase(startTest.fulfilled, (state, action) => {
        state.loading = false;
        state.test = action.payload;
        state.questions = action.payload.questions || [];
        state.timeRemaining = action.payload.duration * 60; // Convert minutes to seconds
      })
      
      // Handle startTest rejected
      .addCase(startTest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Handle startTestAttempt
      .addCase(startTestAttempt.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(startTestAttempt.fulfilled, (state, action) => {
        state.loading = false;
        state.testAttempt = {
          id: action.payload.id,
          startTime: action.payload.startTime,
          endTime: action.payload.endTime
        };
        state.timeRemaining = action.payload.timeRemaining;
        // Ensure questions and options are properly structured
        state.questions = Array.isArray(action.payload.questions)
          ? action.payload.questions.map((q: any) => ({
              ...q,
              options: Array.isArray(q.options)
                ? q.options.map((opt: any) => ({
                    id: opt.id || `opt-${Math.random().toString(36).substr(2, 9)}`,
                    option: opt.text || opt,
                    order: opt.order || 0
                  }))
                : []
            }))
          : [];
      })
      .addCase(startTestAttempt.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as any)?.message || 'Failed to start test attempt';
      });

    // Submit Answer
    builder.addCase(submitTestAnswer.fulfilled, (state, action) => {
      // Update the answer in the state if needed
      const { questionId, answer } = action.meta.arg;
      const questionIndex = state.questions.findIndex((q) => q.id === questionId);
      if (questionIndex !== -1) {
        state.answers[questionId] = answer;
      }
    });

    // Submit Test Attempt
    builder.addCase(submitTestAttempt.pending, (state) => {
      state.isSubmitting = true;
      state.error = null;
    });
    builder.addCase(submitTestAttempt.fulfilled, (state, action) => {
      state.isSubmitting = false;
      state.results = action.payload.data;
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

    // Fetch Tests By Course ID
    builder
      .addCase(fetchTestsByCourseId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTestsByCourseId.fulfilled, (state, action) => {
        state.loading = false;
        state.tests = Array.isArray(action.payload) ? action.payload : [];
        // If you want to set the questions from the first test
        if (state.tests.length > 0 && state.tests[0].questions) {
          state.questions = state.tests[0].questions;
        }
      })
      .addCase(fetchTestsByCourseId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Handle submitAnswer
    builder
      .addCase(submitAnswer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitAnswer.fulfilled, (state, action) => {
        state.loading = false;
        const { questionId, answer } = action.payload.data;
        if (questionId && answer) {
          state.answers[questionId] = answer;
        }
      })
      .addCase(submitAnswer.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as any)?.message || 'Failed to submit answer';
      });

    // Handle submitTest
    builder
      .addCase(submitTest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitTest.fulfilled, (state, action) => {
        state.loading = false;
        state.results = action.payload.data;
        state.testAttempt = {
          ...state.testAttempt,
          status: 'COMPLETED',
          ...action.payload.data
        };
      })
      .addCase(submitTest.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as any)?.message || 'Failed to submit test';
      });
  },
});

export const { setCurrentQuestion, saveAnswer, resetTest, updateTimeRemaining } = testSlice.actions;

export default testSlice.reducer;
