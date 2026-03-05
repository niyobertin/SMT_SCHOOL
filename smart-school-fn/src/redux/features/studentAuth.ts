import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface StudentType {
  id: string;
  studentId: string;
  firstName: string;
  lastName: string;
  email?: string;
  schoolId: string;
  schoolName: string;
}

interface StudentAuthState {
  student: StudentType | null;
  token: string | null;
  selectedAcademicYear: any | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: StudentAuthState = {
  student: localStorage.getItem("student")
    ? JSON.parse(localStorage.getItem("student")!)
    : null,
  token: localStorage.getItem("accessToken_student") || null,
  selectedAcademicYear: localStorage.getItem("selectedAcademicYear")
    ? JSON.parse(localStorage.getItem("selectedAcademicYear")!)
    : null,
  isLoading: false,
  error: null,
};

const studentAuthSlice = createSlice({
  name: "studentAuth",
  initialState,
  reducers: {
    studentLoginStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    studentLoginSuccess: (
      state,
      action: PayloadAction<{ token: string; student: StudentType }>
    ) => {
      state.isLoading = false;
      state.token = action.payload.token;
      state.student = action.payload.student;
      localStorage.setItem("accessToken_student", action.payload.token);
      localStorage.setItem(
        "student",
        JSON.stringify(action.payload.student)
      );
    },
    studentLoginFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    studentLogout: (state) => {
      state.student = null;
      state.token = null;
      localStorage.removeItem("accessToken_student");
      localStorage.removeItem("student");
    },
    updateStudentProfile: (
      state,
      action: PayloadAction<Partial<StudentType>>
    ) => {
      if (state.student) {
        state.student = { ...state.student, ...action.payload };
        localStorage.setItem(
          "student",
          JSON.stringify(state.student)
        );
      }
    },
    setSelectedAcademicYear: (state, action: PayloadAction<any>) => {
      state.selectedAcademicYear = action.payload;
      if (action.payload) {
        localStorage.setItem("selectedAcademicYear", JSON.stringify(action.payload));
      } else {
        localStorage.removeItem("selectedAcademicYear");
      }
    },
  },
});

export const {
  studentLoginStart,
  studentLoginSuccess,
  studentLoginFailure,
  studentLogout,
  updateStudentProfile,
  setSelectedAcademicYear,
} = studentAuthSlice.actions;

export default studentAuthSlice.reducer;
