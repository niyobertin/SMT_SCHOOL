import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../redux/api/api";
import {
    studentLoginStart,
    studentLoginSuccess,
    studentLoginFailure
} from "./studentAuth";

interface StudentLoginCredentials {
    schoolCode: string;
    studentId: string;
    password?: string;
}

export const studentLogin = createAsyncThunk(
    "studentAuth/login",
    async (credentials: StudentLoginCredentials, { dispatch, rejectWithValue }) => {
        try {
            dispatch(studentLoginStart());
            const response = await api.post("/student-auth/login", credentials);

            const payload = {
                token: response.data.data.token,
                student: response.data.data.student
            };

            dispatch(studentLoginSuccess(payload));
            return response.data;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "Student login failed";
            dispatch(studentLoginFailure(errorMessage));
            return rejectWithValue(errorMessage);
        }
    }
);
