import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import api from '../../redux/api/api';

interface ExamPortalState {
    token: string | null;
    candidate: any | null;
    exam: any | null;
    attempt: any | null;
    questions: any[];
    currentQuestionIndex: number;
    answers: { [questionId: string]: any };
    timeRemaining: number | null;
    loading: boolean;
    error: string | null;
    result: any | null;
    isWaiting: boolean;
    scheduledStartTime: string | null;
}

const initialState: ExamPortalState = {
    token: localStorage.getItem('examToken'),
    candidate: null,
    exam: null,
    attempt: null,
    questions: [],
    currentQuestionIndex: 0,
    answers: {},
    timeRemaining: null,
    loading: false,
    error: null,
    result: null,
    isWaiting: false,
    scheduledStartTime: null,
};

interface CandidateLoginCredentials {
    candidateId: string;
    examCode: string;
}

interface SubmitAnswerPayload {
    attemptId: string;
    questionId: string;
    selectedOptions?: string[];
    answerText?: string;
    timeSpent?: number;
}

// Async Thunks
export const candidateLogin = createAsyncThunk(
    'examPortal/login',
    async (credentials: CandidateLoginCredentials, { rejectWithValue }) => {
        try {
            const response = await api.post('/exams/portal/login', credentials);
            localStorage.setItem('examToken', response.data.data.token);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Login failed');
        }
    }
);

export const startExam = createAsyncThunk(
    'examPortal/startExam',
    async (examId: string, { getState, rejectWithValue }) => {
        try {
            const state = getState() as any;
            const token = state.examPortal.token;

            const response = await api.post(
                `/exams/portal/${examId}/start`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to start exam');
        }
    }
);

export const submitAnswer = createAsyncThunk(
    'examPortal/submitAnswer',
    async (payload: SubmitAnswerPayload, { getState, rejectWithValue }) => {
        try {
            const state = getState() as any;
            const token = state.examPortal.token;

            const { attemptId, ...answerData } = payload;

            const response = await api.put(
                `/exams/portal/attempts/${attemptId}/answer`,
                answerData,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to submit answer');
        }
    }
);

export const submitExam = createAsyncThunk(
    'examPortal/submitExam',
    async (attemptId: string, { getState, rejectWithValue }) => {
        try {
            const state = getState() as any;
            const token = state.examPortal.token;

            const response = await api.post(
                `/exams/portal/attempts/${attemptId}/submit`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to submit exam');
        }
    }
);

export const getExamResult = createAsyncThunk(
    'examPortal/getResult',
    async (attemptId: string, { getState, rejectWithValue }) => {
        try {
            const state = getState() as any;
            const token = state.examPortal.token;

            const response = await api.get(
                `/exams/portal/attempts/${attemptId}/result`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to get result');
        }
    }
);

const examPortalSlice = createSlice({
    name: 'examPortal',
    initialState,
    reducers: {
        setCurrentQuestion: (state, action: PayloadAction<number>) => {
            state.currentQuestionIndex = action.payload;
        },
        updateTimeRemaining: (state, action: PayloadAction<number>) => {
            state.timeRemaining = action.payload;
        },
        saveAnswer: (state, action: PayloadAction<{ questionId: string; answer: any }>) => {
            state.answers[action.payload.questionId] = action.payload.answer;
        },
        logout: (state) => {
            localStorage.removeItem('examToken');
            state.token = null;
            state.candidate = null;
            state.exam = null;
            state.attempt = null;
            state.questions = [];
            state.answers = {};
            state.timeRemaining = null;
            state.result = null;
            state.isWaiting = false;
            state.scheduledStartTime = null;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Login
            .addCase(candidateLogin.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(candidateLogin.fulfilled, (state, action) => {
                state.loading = false;
                state.token = action.payload.data.token;
                state.candidate = action.payload.data.candidate;
                state.exam = action.payload.data.exam;
                state.isWaiting = action.payload.data.isWaiting || false;
                state.scheduledStartTime = action.payload.data.exam?.startDate || null;
                state.error = null;
            })
            .addCase(candidateLogin.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Start Exam
            .addCase(startExam.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(startExam.fulfilled, (state, action) => {
                state.loading = false;
                state.attempt = action.payload.data;
                state.questions = action.payload.data.questions;
                state.timeRemaining = action.payload.data.timeRemaining;
                state.currentQuestionIndex = 0;
                state.answers = {};
                state.error = null;
            })
            .addCase(startExam.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Submit Answer
            .addCase(submitAnswer.pending, (state) => {
                state.loading = true;
            })
            .addCase(submitAnswer.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(submitAnswer.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Submit Exam
            .addCase(submitExam.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(submitExam.fulfilled, (state, action) => {
                state.loading = false;
                state.result = action.payload.data;
                state.error = null;
            })
            .addCase(submitExam.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Get Result
            .addCase(getExamResult.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getExamResult.fulfilled, (state, action) => {
                state.loading = false;
                state.result = action.payload.data;
                state.error = null;
            })
            .addCase(getExamResult.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const {
    setCurrentQuestion,
    updateTimeRemaining,
    saveAnswer,
    logout,
    clearError
} = examPortalSlice.actions;

export default examPortalSlice.reducer;
