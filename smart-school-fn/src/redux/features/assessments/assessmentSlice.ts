import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/api";

interface AssessmentState {
    assessments: any[];
    submissions: any[];
    loading: boolean;
    error: string | null;
}

const initialState: AssessmentState = {
    assessments: [],
    submissions: [],
    loading: false,
    error: null,
};

export const fetchAssessments = createAsyncThunk(
    "assessments/fetchAssessments",
    async ({ schoolId, classId, subjectId, term }: { schoolId: string; classId?: string; subjectId?: string; term?: string }) => {
        const response = await api.get(`/schools/${schoolId}/assessments`, {
            params: { classId, subjectId, term },
        });
        return response.data.data;
    }
);

export const createAssessment = createAsyncThunk(
    "assessments/createAssessment",
    async (data: any) => {
        const response = await api.post(`/assessments`, data);
        return response.data.data;
    }
);

export const saveScores = createAsyncThunk(
    "assessments/saveScores",
    async ({ assessmentId, data }: { assessmentId: string; data: any }) => {
        const response = await api.post(`/assessments/${assessmentId}/scores`, data);
        return response.data;
    }
);

export const submitResults = createAsyncThunk(
    "assessments/submitResults",
    async (data: any) => {
        const response = await api.post(`/assessments/submit`, data);
        return response.data.data;
    }
);

export const fetchSubmissions = createAsyncThunk(
    "assessments/fetchSubmissions",
    async ({ schoolId, classId, term }: { schoolId: string; classId?: string; term?: string }) => {
        const response = await api.get(`/schools/${schoolId}/submissions`, {
            params: { classId, term },
        });
        return response.data.data;
    }
);

export const approveResults = createAsyncThunk(
    "assessments/approveResults",
    async ({ submissionId, status }: { submissionId: string; status: "APPROVED" | "REJECTED" }) => {
        const response = await api.put(`/submissions/${submissionId}/approve`, { status });
        return response.data.data;
    }
);

const assessmentSlice = createSlice({
    name: "assessments",
    initialState,
    reducers: {
        clearAssessmentError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Assessments
            .addCase(fetchAssessments.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchAssessments.fulfilled, (state, action) => {
                state.loading = false;
                state.assessments = action.payload;
            })
            .addCase(fetchAssessments.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || "Failed to fetch assessments";
            })

            // Create Assessment (optimistic update or re-fetch can be handled in component)
            .addCase(createAssessment.fulfilled, (state, action) => {
                state.assessments = [action.payload, ...state.assessments];
            })

            // Fetch Submissions
            .addCase(fetchSubmissions.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchSubmissions.fulfilled, (state, action) => {
                state.loading = false;
                state.submissions = action.payload;
            })
            .addCase(fetchSubmissions.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || "Failed to fetch submissions";
            })

            // Generic loading handlers for other write operations
            .addMatcher(
                (action) =>
                    action.type.startsWith("assessments/createAssessment/") ||
                    action.type.startsWith("assessments/saveScores/") ||
                    action.type.startsWith("assessments/submitResults/") ||
                    action.type.startsWith("assessments/approveResults/"),
                (state, action: any) => {
                    if (action.type.endsWith("/pending")) {
                        state.loading = true;
                        state.error = null;
                    } else if (action.type.endsWith("/fulfilled")) {
                        state.loading = false;
                    } else if (action.type.endsWith("/rejected")) {
                        state.loading = false;
                        state.error = action.error?.message || "Operation failed";
                    }
                }
            );
    },
});

export const { clearAssessmentError } = assessmentSlice.actions;
export default assessmentSlice.reducer;
