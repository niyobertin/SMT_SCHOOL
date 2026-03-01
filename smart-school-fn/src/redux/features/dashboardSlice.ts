import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/api';

interface LmsDashboardStats {
    users: number;
    courses: number;
    lessons: number;
    enrollments: number;
    payments: number;
    tests: number;
    questions: number;
    testAttempts: number;
    logs: Array<{
        id: string;
        userId: string;
        action: string;
        user: { username: string; role: string };
        details: string;
        ip: string;
        createdAt: string;
    }>;
    revenueTrend: Array<{
        id: string;
        amount: number;
        status: string;
        createdAt: string;
    }>;
}

interface DashboardState {
    stats: LmsDashboardStats | null;
    loading: boolean;
    error: string | null;
}

const initialState: DashboardState = {
    stats: null,
    loading: false,
    error: null,
};

/**
 * Replaces the raw useEffect + api.get() call in DashboardHome.tsx.
 * Standardizes on Redux Thunks — same pattern used by examAdminSlice.
 */
export const fetchLmsDashboardStats = createAsyncThunk(
    'dashboard/fetchLmsStats',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/users/dashboard/stats');
            if (response.data.status === 'success') {
                return response.data.data as LmsDashboardStats;
            }
            return rejectWithValue('Failed to fetch dashboard stats');
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch dashboard stats'
            );
        }
    }
);

const dashboardSlice = createSlice({
    name: 'dashboard',
    initialState,
    reducers: {
        clearDashboardError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchLmsDashboardStats.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchLmsDashboardStats.fulfilled, (state, action) => {
                state.loading = false;
                state.stats = action.payload;
            })
            .addCase(fetchLmsDashboardStats.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearDashboardError } = dashboardSlice.actions;
export default dashboardSlice.reducer;
