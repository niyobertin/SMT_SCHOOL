import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import api from '../../redux/api/api';

interface ExamAdminState {
    organizations: any[];
    selectedOrg: any | null;
    exams: any[];
    selectedExam: any | null; // Detailed exam with questions
    candidates: any[];
    assignedCandidateIds: string[];
    examResults: any[];
    analytics: any | null;
    dashboardStats: {
        exams: { total: number; published: number; draft: number };
        candidates: { total: number };
        attempts: { total: number; passed: number; avgScore: number; passRate: number };
        recentActivity: Array<{
            id: string;
            candidateName: string;
            examTitle: string;
            score: number;
            status: string;
            date: string;
        }>;
    } | null;
    loading: boolean;
    error: string | null;
}

const initialState: ExamAdminState = {
    organizations: [],
    selectedOrg: null,
    exams: [],
    selectedExam: null,
    candidates: [],
    assignedCandidateIds: [],
    examResults: [],
    analytics: null,
    dashboardStats: null,
    loading: false,
    error: null,
};

// Async Thunks

export const fetchDashboardStats = createAsyncThunk(
    'examAdmin/fetchDashboardStats',
    async (orgId: string | undefined, { rejectWithValue }) => {
        try {
            const query = orgId ? `?organizationId=${orgId}` : '';
            const response = await api.get(`/exams/stats/dashboard${query}`);
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard stats');
        }
    }
);

// Organizations
export const fetchOrganizations = createAsyncThunk(
    'examAdmin/fetchOrganizations',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/exams/organizations');
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch organizations');
        }
    }
);

export const createOrganization = createAsyncThunk(
    'examAdmin/createOrganization',
    async (data: any, { rejectWithValue }) => {
        try {
            const response = await api.post('/exams/organizations', data);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create organization');
        }
    }
);

export const updateOrganization = createAsyncThunk(
    'examAdmin/updateOrganization',
    async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
        try {
            const response = await api.patch(`/exams/organizations/${id}`, data);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update organization');
        }
    }
);

export const deleteOrganization = createAsyncThunk(
    'examAdmin/deleteOrganization',
    async (id: string, { rejectWithValue }) => {
        try {
            await api.delete(`/exams/organizations/${id}`);
            return id;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete organization');
        }
    }
);

// Exams
export const fetchExams = createAsyncThunk(
    'examAdmin/fetchExams',
    async (orgId: string, { rejectWithValue }) => {
        try {
            const response = await api.get(`/exams/organizations/${orgId}/exams`);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch exams');
        }
    }
);

export const createExam = createAsyncThunk(
    'examAdmin/createExam',
    async ({ orgId, data }: { orgId: string; data: any }, { rejectWithValue }) => {
        try {
            const response = await api.post(`/exams/organizations/${orgId}/exams`, data);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create exam');
        }
    }
);

export const fetchExamDetails = createAsyncThunk(
    'examAdmin/fetchExamDetails',
    async (examId: string, { rejectWithValue }) => {
        try {
            const response = await api.get(`/exams/${examId}`);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch exam details');
        }
    }
);

export const updateExam = createAsyncThunk(
    'examAdmin/updateExam',
    async ({ examId, data }: { examId: string; data: any }, { rejectWithValue }) => {
        try {
            const response = await api.patch(`/exams/${examId}`, data);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update exam');
        }
    }
);

export const deleteExam = createAsyncThunk(
    'examAdmin/deleteExam',
    async (examId: string, { rejectWithValue }) => {
        try {
            await api.delete(`/exams/${examId}`);
            return examId;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete exam');
        }
    }
);

// Questions
export const addQuestion = createAsyncThunk(
    'examAdmin/addQuestion',
    async ({ examId, data }: { examId: string; data: any }, { rejectWithValue }) => {
        try {
            const response = await api.post(`/exams/${examId}/questions`, data);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to add question');
        }
    }
);

export const updateQuestion = createAsyncThunk(
    'examAdmin/updateQuestion',
    async ({ examId, questionId, data }: { examId: string; questionId: string; data: any }, { rejectWithValue }) => {
        try {
            const response = await api.put(`/exams/${examId}/questions/${questionId}`, data);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update question');
        }
    }
);

export const deleteQuestion = createAsyncThunk(
    'examAdmin/deleteQuestion',
    async ({ examId, questionId }: { examId: string; questionId: string }, { rejectWithValue }) => {
        try {
            await api.delete(`/exams/${examId}/questions/${questionId}`);
            return questionId;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete question');
        }
    }
);

// Candidates
export const fetchCandidates = createAsyncThunk(
    'examAdmin/fetchCandidates',
    async (orgId: string, { rejectWithValue }) => {
        try {
            const response = await api.get(`/exams/organizations/${orgId}/candidates`);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch candidates');
        }
    }
);

export const fetchExamAssignedCandidates = createAsyncThunk(
    'examAdmin/fetchExamAssignedCandidates',
    async (examId: string, { rejectWithValue }) => {
        try {
            const response = await api.get(`/exams/${examId}/assigned-candidates`);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch assigned candidates');
        }
    }
);

export const createCandidate = createAsyncThunk(
    'examAdmin/createCandidate',
    async ({ orgId, data }: { orgId: string; data: any }, { rejectWithValue }) => {
        try {
            const response = await api.post(`/exams/organizations/${orgId}/candidates`, data);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create candidate');
        }
    }
);

export const updateCandidate = createAsyncThunk(
    'examAdmin/updateCandidate',
    async ({ candidateId, data }: { candidateId: string; data: any }, { rejectWithValue }) => {
        try {
            const response = await api.patch(`/exams/candidates/${candidateId}`, data);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update candidate');
        }
    }
);

export const deleteCandidate = createAsyncThunk(
    'examAdmin/deleteCandidate',
    async (candidateId: string, { rejectWithValue }) => {
        try {
            await api.delete(`/exams/candidates/${candidateId}`);
            return candidateId;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete candidate');
        }
    }
);

// Assignments
export const assignExam = createAsyncThunk(
    'examAdmin/assignExam',
    async ({ examId, candidateId }: { examId: string; candidateId: string }, { rejectWithValue }) => {
        try {
            const response = await api.post(`/exams/${examId}/assign/${candidateId}`);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to assign exam');
        }
    }
);

export const bulkAssignExam = createAsyncThunk(
    'examAdmin/bulkAssignExam',
    async ({ examId, candidateIds }: { examId: string; candidateIds: string[] }, { rejectWithValue }) => {
        try {
            const response = await api.post(`/exams/${examId}/assign-bulk`, { candidateIds });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to bulk assign exams');
        }
    }
);

// Results & Analytics
export const fetchExamResults = createAsyncThunk(
    'examAdmin/fetchExamResults',
    async (examId: string, { rejectWithValue }) => {
        try {
            const response = await api.get(`/exams/${examId}/results`);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch results');
        }
    }
);

export const fetchExamAnalytics = createAsyncThunk(
    'examAdmin/fetchExamAnalytics',
    async (examId: string, { rejectWithValue }) => {
        try {
            const response = await api.get(`/exams/${examId}/analytics`);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch analytics');
        }
    }
);

const examAdminSlice = createSlice({
    name: 'examAdmin',
    initialState,
    reducers: {
        setSelectedOrg: (state, action) => {
            state.selectedOrg = action.payload;
        },
        setSelectedExam: (state, action) => {
            state.selectedExam = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Dashboard Stats
            .addCase(fetchDashboardStats.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchDashboardStats.fulfilled, (state, action) => {
                state.loading = false;
                state.dashboardStats = action.payload;
            })
            .addCase(fetchDashboardStats.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Organizations
            .addCase(fetchOrganizations.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchOrganizations.fulfilled, (state, action) => {
                state.loading = false;
                state.organizations = action.payload.data;
            })
            .addCase(fetchOrganizations.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(createOrganization.fulfilled, (state, action) => {
                state.organizations.push(action.payload.data);
            })
            .addCase(updateOrganization.fulfilled, (state, action) => {
                const index = state.organizations.findIndex(o => o.id === action.payload.data.id);
                if (index !== -1) {
                    state.organizations[index] = action.payload.data;
                }
                if (state.selectedOrg?.id === action.payload.data.id) {
                    state.selectedOrg = action.payload.data;
                }
            })
            .addCase(deleteOrganization.fulfilled, (state, action) => {
                state.organizations = state.organizations.filter(o => o.id !== action.payload);
                if (state.selectedOrg?.id === action.payload) {
                    state.selectedOrg = null;
                }
            })
            // Exams
            .addCase(fetchExams.fulfilled, (state, action) => {
                state.exams = action.payload.data;
            })
            .addCase(createExam.fulfilled, (state, action) => {
                state.exams.push(action.payload.data);
            })
            .addCase(updateExam.fulfilled, (state, action) => {
                const index = state.exams.findIndex(e => e.id === action.payload.data.id);
                if (index !== -1) {
                    state.exams[index] = action.payload.data;
                }
            })
            .addCase(deleteExam.fulfilled, (state, action) => {
                state.exams = state.exams.filter(e => e.id !== action.payload);
            })
            // Exam Details
            .addCase(fetchExamDetails.fulfilled, (state, action) => {
                state.selectedExam = action.payload.data;
            })
            // Questions
            .addCase(addQuestion.fulfilled, (state, action) => {
                if (state.selectedExam && state.selectedExam.id === action.meta.arg.examId) {
                    // Optimistically add question if we have structure, otherwise maybe just re-fetch
                    // Assuming backend returns the created question
                    if (!state.selectedExam.questions) state.selectedExam.questions = [];
                    state.selectedExam.questions.push(action.payload.data);
                }
            })
            .addCase(updateQuestion.fulfilled, (state, action) => {
                if (state.selectedExam && state.selectedExam.id === action.meta.arg.examId) {
                    const qIndex = state.selectedExam.questions?.findIndex((q: any) => q.id === action.meta.arg.questionId);
                    if (qIndex !== undefined && qIndex !== -1) {
                        state.selectedExam.questions[qIndex] = action.payload.data;
                    }
                }
            })
            .addCase(deleteQuestion.fulfilled, (state, action) => {
                if (state.selectedExam && state.selectedExam.id === action.meta.arg.examId) {
                    state.selectedExam.questions = state.selectedExam.questions.filter((q: any) => q.id !== action.meta.arg.questionId);
                }
            })
            // Candidates
            .addCase(fetchCandidates.fulfilled, (state, action) => {
                state.candidates = action.payload.data;
            })
            .addCase(fetchExamAssignedCandidates.fulfilled, (state, action) => {
                state.assignedCandidateIds = action.payload.data;
            })
            .addCase(createCandidate.fulfilled, (state, action) => {
                state.candidates.push(action.payload.data);
            })
            .addCase(updateCandidate.fulfilled, (state, action) => {
                const index = state.candidates.findIndex(c => c.id === action.payload.data.id);
                if (index !== -1) {
                    state.candidates[index] = action.payload.data;
                }
            })
            .addCase(deleteCandidate.fulfilled, (state, action) => {
                state.candidates = state.candidates.filter(c => c.id !== action.payload);
            })
    },
});

export const { setSelectedOrg, setSelectedExam, clearError } = examAdminSlice.actions;
export default examAdminSlice.reducer;
