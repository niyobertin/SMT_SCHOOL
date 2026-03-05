import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/api";

interface AcademicState {
    years: any[];
    classes: any[];
    subjects: any[];
    assignments: any[];
    classStudents: any[];
    attendance: any[];
    selectedYearId: string | null;
    selectedYear: any | null;
    loading: boolean;
    error: string | null;
}

const initialState: AcademicState = {
    years: [],
    classes: [],
    subjects: [],
    assignments: [],
    classStudents: [],
    attendance: [],
    selectedYearId: localStorage.getItem("selectedYearId") || null,
    selectedYear: localStorage.getItem("selectedYear") ? JSON.parse(localStorage.getItem("selectedYear")!) : null,
    loading: false,
    error: null,
};

export const fetchAcademicYears = createAsyncThunk(
    "academic/fetchYears",
    async (schoolId: string) => {
        const response = await api.get(`/academic/schools/${schoolId}/academic-years`);
        return response.data.data;
    }
);

export const createAcademicYear = createAsyncThunk(
    "academic/createYear",
    async ({ schoolId, data }: { schoolId: string; data: any }) => {
        const response = await api.post(`/academic/schools/${schoolId}/academic-years`, data);
        return response.data.data;
    }
);

export const fetchClasses = createAsyncThunk(
    "academic/fetchClasses",
    async ({ schoolId, academicYearId }: { schoolId: string; academicYearId?: string }) => {
        const response = await api.get(`/academic/schools/${schoolId}/classes`, {
            params: { academicYearId },
        });
        return response.data.data;
    }
);

export const createClass = createAsyncThunk(
    "academic/createClass",
    async ({ schoolId, data }: { schoolId: string; data: any }) => {
        const response = await api.post(`/academic/schools/${schoolId}/classes`, data);
        return response.data.data;
    }
);

export const fetchSubjects = createAsyncThunk(
    "academic/fetchSubjects",
    async (schoolId: string) => {
        const response = await api.get(`/academic/schools/${schoolId}/subjects`);
        return response.data.data;
    }
);

export const fetchClassStudents = createAsyncThunk(
    "academic/fetchClassStudents",
    async ({ schoolId, classId }: { schoolId: string; classId: string }) => {
        const response = await api.get(`/academic/schools/${schoolId}/classes/${classId}/students`);
        return response.data.data;
    }
);


export const createSubject = createAsyncThunk(
    "academic/createSubject",
    async ({ schoolId, data }: { schoolId: string; data: any }) => {
        const response = await api.post(`/academic/schools/${schoolId}/subjects`, data);
        return response.data.data;
    }
);

export const fetchAssignments = createAsyncThunk(
    "academic/fetchAssignments",
    async (schoolId: string) => {
        const response = await api.get(`/assignments/schools/${schoolId}/course-assignments`);
        return response.data.data;
    }
);

export const createAssignment = createAsyncThunk(
    "academic/createAssignment",
    async ({ schoolId, data }: { schoolId: string; data: any }) => {
        const response = await api.post(`/assignments/schools/${schoolId}/course-assignments`, data);
        return response.data.data;
    }
);

export const deleteAssignment = createAsyncThunk(
    "academic/deleteAssignment",
    async (assignmentId: string) => {
        await api.delete(`/assignments/assignments/${assignmentId}`);
        return assignmentId;
    }
);

export const fetchAttendance = createAsyncThunk(
    "academic/fetchAttendance",
    async (params: { schoolId: string; classId?: string; subjectId?: string; studentId?: string; startDate?: string; endDate?: string }) => {
        const response = await api.get(`/academic/schools/${params.schoolId}/attendance`, {
            params,
        });
        return response.data.data;
    }
);

export const recordAttendance = createAsyncThunk(
    "academic/recordAttendance",
    async ({ schoolId, data }: { schoolId: string; data: any }) => {
        const response = await api.post(`/academic/schools/${schoolId}/attendance`, data);
        return response.data.data;
    }
);

export const bulkRecordAttendance = createAsyncThunk(
    "academic/bulkRecordAttendance",
    async ({ schoolId, data }: { schoolId: string; data: any }) => {
        const response = await api.post(`/academic/schools/${schoolId}/attendance/bulk`, data);
        return response.data.data;
    }
);

const academicSlice = createSlice({
    name: "academic",
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        setSelectedYear: (state, action) => {
            state.selectedYear = action.payload;
            state.selectedYearId = action.payload?.id || null;
            if (action.payload) {
                localStorage.setItem("selectedYearId", action.payload.id);
                localStorage.setItem("selectedYear", JSON.stringify(action.payload));
            } else {
                localStorage.removeItem("selectedYearId");
                localStorage.removeItem("selectedYear");
            }
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Years
            .addCase(fetchAcademicYears.pending, (state) => { state.loading = true; })
            .addCase(fetchAcademicYears.fulfilled, (state, action) => {
                state.loading = false;
                state.years = action.payload;
            })
            .addCase(fetchAcademicYears.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || "Failed to fetch years";
            })
            // Fetch Classes
            .addCase(fetchClasses.fulfilled, (state, action) => {
                state.classes = action.payload;
            })
            // Fetch Subjects
            .addCase(fetchSubjects.fulfilled, (state, action) => {
                state.subjects = action.payload;
            })
            // Fetch Assignments
            .addCase(fetchAssignments.fulfilled, (state, action) => {
                state.assignments = action.payload;
            })
            // Fetch Class Students
            .addCase(fetchClassStudents.fulfilled, (state, action) => {
                state.classStudents = action.payload;
            })
            // Fetch Attendance
            .addCase(fetchAttendance.fulfilled, (state, action) => {
                state.attendance = action.payload;
            })
            // Delete Assignment
            .addCase(deleteAssignment.fulfilled, (state, action) => {
                state.assignments = state.assignments.filter(a => a.id !== action.payload);
            })
            // Create operations can be added similarly if needed to update state immediately
            .addMatcher(
                (action) => action.type.endsWith("/pending") && action.type.startsWith("academic/"),
                (state) => { state.loading = true; state.error = null; }
            )
            .addMatcher(
                (action) => action.type.endsWith("/fulfilled") && action.type.startsWith("academic/"),
                (state) => { state.loading = false; }
            )
            .addMatcher(
                (action) => action.type.endsWith("/rejected") && action.type.startsWith("academic/"),
                (state, action: any) => {
                    state.loading = false;
                    state.error = action.error.message;
                }
            );
    },
});

export const { clearError, setSelectedYear } = academicSlice.actions;
export default academicSlice.reducer;
