import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../redux/api/api';

interface ExamAdminState {
    organizations: any[];
    selectedOrg: any | null;
    exams: any[];
    selectedExam: any | null; // Detailed exam with questions
    candidates: any[];
    assignedCandidateIds: string[];
    examResults: any[];
    globalResults: {
        data: any[];
        meta: { total: number; averageScore: number };
        pagination: { page: number; limit: number; total: number; pages: number } | undefined;
    } | null;
    candidatesPagination: { page: number; limit: number; total: number; pages: number } | null;
    analytics: any | null;
    dashboardStats: {
        organizations?: { total: number };
        questions?: { total: number };
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
        examDurationStats?: Array<{
            examTitle: string;
            avgTimeMinutes: number;
        }>;
    } | null;
    loading: boolean;
    error: string | null;
    openEndedResponses: any[];
    academicYears: any[];
    grades: any[];
    classRooms: any[];
    subjects: any[];
    academicRecords: any[];
}

const initialState: ExamAdminState = {
    organizations: [],
    selectedOrg: null,
    exams: [],
    selectedExam: null,
    candidates: [],
    assignedCandidateIds: [],
    examResults: [],
    globalResults: null,
    candidatesPagination: null,
    analytics: null,
    dashboardStats: null,
    loading: false,
    error: null,
    openEndedResponses: [],
    academicYears: [],
    grades: [],
    classRooms: [],
    subjects: [],
    academicRecords: [],
};

// Async Thunks

export const fetchDashboardStats = createAsyncThunk(
    'examAdmin/fetchDashboardStats',
    async ({ orgId, startDate, endDate }: { orgId?: string; startDate?: string; endDate?: string }, { rejectWithValue }) => {
        try {
            const params = new URLSearchParams();
            if (orgId) params.append('organizationId', orgId);
            if (startDate) params.append('startDate', startDate);
            if (endDate) params.append('endDate', endDate);

            const response = await api.get(`/exams/stats/dashboard?${params.toString()}`);
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

export const fetchAllExams = createAsyncThunk(
    'examAdmin/fetchAllExams',
    async (
        params: {
            organizationId?: string;
            status?: string;
            search?: string;
            date?: string;
            archived?: boolean;
        },
        { rejectWithValue }
    ) => {
        try {
            const query = new URLSearchParams();
            if (params.organizationId) query.append('organizationId', params.organizationId);
            if (params.status) query.append('status', params.status);
            if (params.search) query.append('search', params.search);
            if (params.date) query.append('date', params.date);
            if (params.archived !== undefined) query.append('archived', String(params.archived));

            const response = await api.get(`/exams/all?${query.toString()}`);
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

export const archiveExam = createAsyncThunk(
    'examAdmin/archiveExam',
    async (examId: string, { rejectWithValue }) => {
        try {
            await api.patch(`/exams/${examId}/archive`);
            return examId;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to archive exam');
        }
    }
);

export const unarchiveExam = createAsyncThunk(
    'examAdmin/unarchiveExam',
    async (examId: string, { rejectWithValue }) => {
        try {
            await api.patch(`/exams/${examId}/unarchive`);
            return examId;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to unarchive exam');
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

// Questions (data can be plain object or FormData when image is included)
export const addQuestion = createAsyncThunk(
    'examAdmin/addQuestion',
    async ({ examId, data }: { examId: string; data: any }, { rejectWithValue }) => {
        try {
            const isFormData = data instanceof FormData;
            const config = isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
            const response = await api.post(`/exams/${examId}/questions`, data, config);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to add question');
        }
    }
);

export const bulkAddQuestions = createAsyncThunk(
    'examAdmin/bulkAddQuestions',
    async ({ examId, questions }: { examId: string; questions: any[] }, { rejectWithValue }) => {
        try {
            const response = await api.post(`/exams/${examId}/questions/bulk`, { questions });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to bulk add questions');
        }
    }
);

export const updateQuestion = createAsyncThunk(
    'examAdmin/updateQuestion',
    async ({ examId: _examId, questionId, data }: { examId: string; questionId: string; data: any }, { rejectWithValue }) => {
        try {
            const isFormData = data instanceof FormData;
            const config = isFormData ? { headers: { 'Content-Type': undefined } } : {};
            const response = await api.patch(`/exams/questions/${questionId}`, data, config);
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
    async (orgId: string | undefined, { rejectWithValue }) => {
        try {
            const url = orgId ? `/exams/organizations/${orgId}/candidates` : '/exams/candidates/all?limit=1000';
            const response = await api.get(url);
            return orgId ? response.data : response.data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch candidates');
        }
    }
);

export const fetchAllCandidates = createAsyncThunk(
    'examAdmin/fetchAllCandidates',
    async (
        params: {
            organizationId?: string;
            search?: string;
            page?: number;
            limit?: number;
            batch?: string;
            grade?: string;
            department?: string;
            archived?: boolean;
        },
        { rejectWithValue }
    ) => {
        try {
            const query = new URLSearchParams();
            if (params.organizationId) query.append('organizationId', params.organizationId);
            if (params.search) query.append('search', params.search);
            if (params.page) query.append('page', String(params.page));
            if (params.limit) query.append('limit', String(params.limit));
            if (params.batch) query.append('batch', params.batch);
            if (params.grade) query.append('grade', params.grade);
            if (params.department) query.append('department', params.department);
            if (params.archived !== undefined) query.append('archived', String(params.archived));

            const response = await api.get(`/exams/candidates/all?${query.toString()}`);
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

export const bulkCreateCandidates = createAsyncThunk(
    'examAdmin/bulkCreateCandidates',
    async ({ orgId, candidates }: { orgId: string; candidates: any[] }, { rejectWithValue }) => {
        try {
            const response = await api.post(`/exams/organizations/${orgId}/candidates/bulk`, { candidates });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to bulk create candidates');
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

export const archiveCandidate = createAsyncThunk(
    'examAdmin/archiveCandidate',
    async (candidateId: string, { rejectWithValue }) => {
        try {
            await api.patch(`/exams/candidates/${candidateId}/archive`);
            return candidateId;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to archive candidate');
        }
    }
);

export const unarchiveCandidate = createAsyncThunk(
    'examAdmin/unarchiveCandidate',
    async (candidateId: string, { rejectWithValue }) => {
        try {
            await api.patch(`/exams/candidates/${candidateId}/unarchive`);
            return candidateId;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to unarchive candidate');
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
    async ({ examId, candidateIds, notify = true }: { examId: string; candidateIds: string[]; notify?: boolean }, { rejectWithValue }) => {
        try {
            const response = await api.post(`/exams/${examId}/assign-bulk?notify=${notify}`, { candidateIds });
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

export const fetchGlobalExamResults = createAsyncThunk(
    'examAdmin/fetchGlobalExamResults',
    async (
        params: {
            organizationId?: string;
            examId?: string;
            startDate?: string;
            endDate?: string;
            status?: string;
            page?: number;
            limit?: number;
        },
        { rejectWithValue }
    ) => {
        try {
            const query = new URLSearchParams();
            if (params.organizationId) query.append('organizationId', params.organizationId);
            if (params.examId) query.append('examId', params.examId);
            if (params.startDate) query.append('startDate', params.startDate);
            if (params.endDate) query.append('endDate', params.endDate);
            if (params.status) query.append('status', params.status);
            if (params.page) query.append('page', String(params.page));
            if (params.limit) query.append('limit', String(params.limit));

            const response = await api.get(`/exams/results/all?${query.toString()}`);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch global results');
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

export const fetchOpenEndedResponses = createAsyncThunk(
    'examAdmin/fetchOpenEndedResponses',
    async (examId: string | undefined, { rejectWithValue }) => {
        try {
            const url = examId && examId !== 'all'
                ? `/exams/${examId}/open-ended-responses`
                : '/exams/all/open-ended-responses';
            const response = await api.get(url);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch responses');
        }
    }
);

export const markAnswer = createAsyncThunk(
    'examAdmin/markAnswer',
    async ({ answerId, manualScore, feedback }: { answerId: string; manualScore: number; feedback?: string }, { rejectWithValue }) => {
        try {
            const response = await api.post(`/exams/answers/${answerId}/mark`, { manualScore, feedback });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to submit mark');
        }
    }
);

export const authorizeRetake = createAsyncThunk(
    'examAdmin/authorizeRetake',
    async ({ assignmentId, allowRetake }: { assignmentId: string; allowRetake: boolean }, { rejectWithValue }) => {
        try {
            const response = await api.post(`/exams/assignments/${assignmentId}/authorize-retake`, { allowRetake });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to authorize retake');
        }
    }
);

// Academic Hierarchy Thunks

export const fetchAcademicYears = createAsyncThunk(
    'examAdmin/fetchAcademicYears',
    async (organizationId: string | undefined, { rejectWithValue }) => {
        try {
            const headers: any = {};
            if (organizationId) {
                headers['x-organization-id'] = organizationId;
            }
            const response = await api.get('/academic/years', { headers });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch academic years');
        }
    }
);

export const createAcademicYear = createAsyncThunk(
    'examAdmin/createAcademicYear',
    async (data: any, { rejectWithValue }) => {
        try {
            const response = await api.post('/academic/years', data);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create academic year');
        }
    }
);

export const updateAcademicYear = createAsyncThunk(
    'examAdmin/updateAcademicYear',
    async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
        try {
            const response = await api.put(`/academic/years/${id}`, data);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update academic year');
        }
    }
);

export const deleteAcademicYear = createAsyncThunk(
    'examAdmin/deleteAcademicYear',
    async (id: string, { rejectWithValue }) => {
        try {
            await api.delete(`/academic/years/${id}`);
            return id;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete academic year');
        }
    }
);

export const fetchGrades = createAsyncThunk(
    'examAdmin/fetchGrades',
    async (organizationId: string | undefined, { rejectWithValue }) => {
        try {
            const headers: any = {};
            if (organizationId) {
                headers['x-organization-id'] = organizationId;
            }
            const response = await api.get('/academic/grades', { headers });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch grades');
        }
    }
);

export const createGrade = createAsyncThunk(
    'examAdmin/createGrade',
    async (data: any, { rejectWithValue }) => {
        try {
            const response = await api.post('/academic/grades', data);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create grade');
        }
    }
);

export const updateGrade = createAsyncThunk(
    'examAdmin/updateGrade',
    async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
        try {
            const response = await api.put(`/academic/grades/${id}`, data);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update grade');
        }
    }
);

export const deleteGrade = createAsyncThunk(
    'examAdmin/deleteGrade',
    async (id: string, { rejectWithValue }) => {
        try {
            await api.delete(`/academic/grades/${id}`);
            return id;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete grade');
        }
    }
);

export const createClassRoom = createAsyncThunk(
    'examAdmin/createClassRoom',
    async (data: any, { rejectWithValue }) => {
        try {
            const response = await api.post('/academic/classrooms', data);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create classroom');
        }
    }
);

export const updateClassRoom = createAsyncThunk(
    'examAdmin/updateClassRoom',
    async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
        try {
            const response = await api.put(`/academic/classrooms/${id}`, data);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update classroom');
        }
    }
);

export const deleteClassRoom = createAsyncThunk(
    'examAdmin/deleteClassRoom',
    async (id: string, { rejectWithValue }) => {
        try {
            await api.delete(`/academic/classrooms/${id}`);
            return id;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete classroom');
        }
    }
);

export const fetchSubjects = createAsyncThunk(
    'examAdmin/fetchSubjects',
    async (organizationId: string | undefined, { rejectWithValue }) => {
        try {
            const headers: any = {};
            if (organizationId) {
                headers['x-organization-id'] = organizationId;
            }
            const response = await api.get('/academic/subjects', { headers });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch subjects');
        }
    }
);

export const createSubject = createAsyncThunk(
    'examAdmin/createSubject',
    async (data: any, { rejectWithValue }) => {
        try {
            const response = await api.post('/academic/subjects', data);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create subject');
        }
    }
);

export const updateSubject = createAsyncThunk(
    'examAdmin/updateSubject',
    async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
        try {
            const response = await api.put(`/academic/subjects/${id}`, data);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update subject');
        }
    }
);

export const deleteSubject = createAsyncThunk(
    'examAdmin/deleteSubject',
    async (id: string, { rejectWithValue }) => {
        try {
            await api.delete(`/academic/subjects/${id}`);
            return id;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete subject');
        }
    }
);

export const bulkAssignToClass = createAsyncThunk(
    'examAdmin/bulkAssignToClass',
    async (data: any, { rejectWithValue }) => {
        try {
            const response = await api.post('/academic/bulk-assign', data);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to assign students');
        }
    }
);

// Result Approvals

export const submitExamForApproval = createAsyncThunk(
    'examAdmin/submitExamForApproval',
    async (attemptId: string, { rejectWithValue }) => {
        try {
            const response = await api.post(`/exams/attempts/${attemptId}/submit-for-approval`);
            return { attemptId, data: response.data };
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to submit exam for approval');
        }
    }
);

export const approveExamResult = createAsyncThunk(
    'examAdmin/approveExamResult',
    async (attemptId: string, { rejectWithValue }) => {
        try {
            const response = await api.post(`/exams/attempts/${attemptId}/approve`);
            return { attemptId, data: response.data };
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to approve exam result');
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
            // Fetch All Exams
            .addCase(fetchAllExams.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllExams.fulfilled, (state, action) => {
                state.loading = false;
                state.exams = action.payload.data;
            })
            .addCase(fetchAllExams.rejected, (state, action) => {
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
            .addCase(deleteExam.fulfilled, (state, action) => {
                state.loading = false;
                state.exams = state.exams.filter(e => e.id !== action.payload);
            })
            .addCase(deleteExam.pending, (state) => {
                state.loading = true;
            })
            .addCase(deleteExam.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(archiveExam.fulfilled, (state, action) => {
                const index = state.exams.findIndex(e => e.id === action.payload);
                if (index !== -1) {
                    state.exams[index].status = 'ARCHIVED'; // Assuming backend updates status to ARCHIVED or we just mark it
                    // Or if we filter out archived:
                    // state.exams = state.exams.filter(e => e.id !== action.payload);
                }
            })
            .addCase(unarchiveExam.fulfilled, (state, action) => {
                // Logic would depend on if we re-fetch or just update local
                const index = state.exams.findIndex(e => e.id === action.payload);
                if (index !== -1) {
                    state.exams[index].status = 'DRAFT'; // Or whatever default unarchived status
                }
            })
            // Exam Details
            .addCase(fetchExamDetails.fulfilled, (state, action) => {
                state.selectedExam = action.payload.data;
            })
            // Questions
            // Candidates
            .addCase(fetchCandidates.fulfilled, (state, action) => {
                state.candidates = action.payload.data;
            })
            .addCase(fetchAllCandidates.fulfilled, (state, action) => {
                state.candidates = action.payload.data;
                state.candidatesPagination = action.payload.pagination || null;
            })
            .addCase(fetchExamAssignedCandidates.fulfilled, (state, action) => {
                state.assignedCandidateIds = action.payload.data;
            })
            // Global Results
            .addCase(fetchGlobalExamResults.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchGlobalExamResults.fulfilled, (state, action) => {
                state.loading = false;
                state.globalResults = {
                    data: action.payload.data,
                    meta: action.payload.meta,
                    pagination: action.payload.pagination,
                };
            })
            .addCase(fetchGlobalExamResults.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(deleteCandidate.fulfilled, (state, action) => {
                state.loading = false;
                state.candidates = state.candidates.filter(c => c.id !== action.payload);
            })
            .addCase(deleteCandidate.pending, (state) => {
                state.loading = true;
            })
            .addCase(deleteCandidate.rejected, (state) => {
                state.loading = false;
            })
            .addCase(archiveCandidate.fulfilled, (state, action) => {
                const index = state.candidates.findIndex(c => c.id === action.payload);
                if (index !== -1) {
                    state.candidates[index].isArchived = true;
                    // Optionally remove from list if we are only showing active
                }
            })
            .addCase(unarchiveCandidate.fulfilled, (state, action) => {
                const index = state.candidates.findIndex(c => c.id === action.payload);
                if (index !== -1) {
                    state.candidates[index].isArchived = false;
                }
            })
            // Bulk Candidates
            .addCase(bulkCreateCandidates.pending, (state) => {
                state.loading = true;
            })
            .addCase(bulkCreateCandidates.fulfilled, (state, action) => {
                state.loading = false;
                state.candidates = [...state.candidates, ...action.payload.data];
            })
            .addCase(bulkCreateCandidates.rejected, (state) => {
                state.loading = false;
            })
            // Bulk Questions
            .addCase(bulkAddQuestions.pending, (state) => {
                state.loading = true;
            })
            .addCase(bulkAddQuestions.fulfilled, (state, action) => {
                state.loading = false;
                if (state.selectedExam && state.selectedExam.id === action.meta.arg.examId) {
                    if (!state.selectedExam.questions) state.selectedExam.questions = [];
                    state.selectedExam.questions = [...state.selectedExam.questions, ...action.payload.data];
                }
            })
            .addCase(bulkAddQuestions.rejected, (state) => {
                state.loading = false;
            })
            // mutation loading states
            .addCase(createExam.pending, (state) => { state.loading = true; })
            .addCase(createExam.fulfilled, (state, action) => {
                state.loading = false;
                state.exams.push(action.payload.data);
            })
            .addCase(createExam.rejected, (state) => { state.loading = false; })
            .addCase(updateExam.pending, (state) => { state.loading = true; })
            .addCase(updateExam.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.exams.findIndex(e => e.id === action.payload.data.id);
                if (index !== -1) {
                    state.exams[index] = action.payload.data;
                }
            })
            .addCase(updateExam.rejected, (state) => { state.loading = false; })
            .addCase(addQuestion.pending, (state) => { state.loading = true; })
            .addCase(addQuestion.fulfilled, (state, action) => {
                state.loading = false;
                if (state.selectedExam && state.selectedExam.id === action.meta.arg.examId) {
                    if (!state.selectedExam.questions) state.selectedExam.questions = [];
                    state.selectedExam.questions.push(action.payload.data);
                }
            })
            .addCase(addQuestion.rejected, (state) => { state.loading = false; })
            .addCase(updateQuestion.pending, (state) => { state.loading = true; })
            .addCase(updateQuestion.fulfilled, (state, action) => {
                state.loading = false;
                if (state.selectedExam && state.selectedExam.id === action.meta.arg.examId) {
                    const qIndex = state.selectedExam.questions?.findIndex((q: any) => q.id === action.meta.arg.questionId);
                    if (qIndex !== undefined && qIndex !== -1) {
                        state.selectedExam.questions[qIndex] = action.payload.data;
                    }
                }
            })
            .addCase(updateQuestion.rejected, (state) => { state.loading = false; })
            .addCase(deleteQuestion.pending, (state) => { state.loading = true; })
            .addCase(deleteQuestion.fulfilled, (state, action) => {
                state.loading = false;
                if (state.selectedExam && state.selectedExam.id === action.meta.arg.examId) {
                    state.selectedExam.questions = state.selectedExam.questions.filter((q: any) => q.id !== action.meta.arg.questionId);
                }
            })
            .addCase(deleteQuestion.rejected, (state) => { state.loading = false; })
            .addCase(createCandidate.pending, (state) => { state.loading = true; })
            .addCase(createCandidate.fulfilled, (state, action) => {
                state.loading = false;
                state.candidates.push(action.payload.data);
            })
            .addCase(createCandidate.rejected, (state) => { state.loading = false; })
            .addCase(updateCandidate.pending, (state) => { state.loading = true; })
            .addCase(updateCandidate.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.candidates.findIndex(c => c.id === action.payload.data.id);
                if (index !== -1) {
                    state.candidates[index] = action.payload.data;
                }
            })
            .addCase(updateCandidate.rejected, (state) => { state.loading = false; })
            .addCase(bulkAssignExam.pending, (state) => { state.loading = true; })
            .addCase(bulkAssignExam.fulfilled, (state) => { state.loading = false; })
            .addCase(bulkAssignExam.rejected, (state) => { state.loading = false; })
            .addCase(authorizeRetake.pending, (state) => {
                state.loading = true;
            })
            .addCase(authorizeRetake.fulfilled, (state, action) => {
                state.loading = false;
                if (state.globalResults?.data) {
                    const updatedAssignment = action.payload.data;
                    state.globalResults.data = state.globalResults.data.map(attempt => {
                        if (attempt.candidateId === updatedAssignment.candidateId && attempt.examId === updatedAssignment.examId) {
                            return {
                                ...attempt,
                                assignment: updatedAssignment
                            };
                        }
                        return attempt;
                    });
                }
            })
            .addCase(authorizeRetake.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Open Ended Responses
            .addCase(fetchOpenEndedResponses.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchOpenEndedResponses.fulfilled, (state, action) => {
                state.loading = false;
                state.openEndedResponses = action.payload.data.responses;
            })
            .addCase(fetchOpenEndedResponses.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(markAnswer.fulfilled, (state, action) => {
                // Update local state for immediate feedback
                if (state.openEndedResponses) {
                    const updatedAnswer = action.payload.data;
                    const index = state.openEndedResponses.findIndex((a: any) => a.id === updatedAnswer.id);
                    if (index !== -1) {
                        state.openEndedResponses[index] = updatedAnswer;
                    }
                }
            })
            // Academic Hierarchy
            .addCase(fetchAcademicYears.fulfilled, (state, action) => {
                state.academicYears = action.payload.data;
            })
            .addCase(createAcademicYear.fulfilled, (state, action) => {
                state.academicYears.push(action.payload.data);
            })
            .addCase(updateAcademicYear.fulfilled, (state, action) => {
                const index = state.academicYears.findIndex(y => y.id === action.payload.data.id);
                if (index !== -1) {
                    state.academicYears[index] = action.payload.data;
                }
            })
            .addCase(deleteAcademicYear.fulfilled, (state, action) => {
                state.academicYears = state.academicYears.filter(y => y.id !== action.payload);
            })
            .addCase(fetchGrades.fulfilled, (state, action) => {
                state.grades = action.payload.data;
            })
            .addCase(createGrade.fulfilled, (state, action) => {
                state.grades.push(action.payload.data);
            })
            .addCase(updateGrade.fulfilled, (state, action) => {
                const index = state.grades.findIndex(g => g.id === action.payload.data.id);
                if (index !== -1) {
                    state.grades[index] = action.payload.data;
                }
            })
            .addCase(deleteGrade.fulfilled, (state, action) => {
                state.grades = state.grades.filter(g => g.id !== action.payload);
            })
            .addCase(createClassRoom.fulfilled, (state, action) => {
                // Find grade and push classroom
                const grade = state.grades.find(g => g.id === action.payload.data.gradeId);
                if (grade) {
                    if (!grade.classRooms) grade.classRooms = [];
                    grade.classRooms.push(action.payload.data);
                }
            })
            .addCase(updateClassRoom.fulfilled, (state, action) => {
                state.grades.forEach(grade => {
                    const index = grade.classRooms?.findIndex((c: any) => c.id === action.payload.data.id);
                    if (index !== undefined && index !== -1) {
                        grade.classRooms[index] = action.payload.data;
                    }
                });
            })
            .addCase(deleteClassRoom.fulfilled, (state, action) => {
                state.grades.forEach(grade => {
                    if (grade.classRooms) {
                        grade.classRooms = grade.classRooms.filter((c: any) => c.id !== action.payload);
                    }
                });
            })
            .addCase(fetchSubjects.fulfilled, (state, action) => {
                state.subjects = action.payload.data;
            })
            .addCase(createSubject.fulfilled, (state, action) => {
                state.subjects.push(action.payload.data);
            })
            .addCase(updateSubject.fulfilled, (state, action) => {
                const index = state.subjects.findIndex(s => s.id === action.payload.data.id);
                if (index !== -1) {
                    state.subjects[index] = action.payload.data;
                }
            })
            .addCase(deleteSubject.fulfilled, (state, action) => {
                state.subjects = state.subjects.filter(s => s.id !== action.payload);
            })
            // Approvals
            .addCase(submitExamForApproval.fulfilled, (state, action) => {
                if (state.globalResults?.data) {
                    const index = state.globalResults.data.findIndex(a => a.id === action.payload.attemptId);
                    if (index !== -1) {
                        state.globalResults.data[index].approvalStatus = 'PENDING';
                    }
                }
            })
            .addCase(approveExamResult.fulfilled, (state, action) => {
                if (state.globalResults?.data) {
                    const index = state.globalResults.data.findIndex(a => a.id === action.payload.attemptId);
                    if (index !== -1) {
                        state.globalResults.data[index].approvalStatus = 'APPROVED';
                    }
                }
            })
    },
});

export const { setSelectedOrg, setSelectedExam, clearError } = examAdminSlice.actions;
export default examAdminSlice.reducer;
