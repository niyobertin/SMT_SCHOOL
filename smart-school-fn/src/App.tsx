import { BrowserRouter, Routes, Route, Navigate, useRoutes, Outlet } from "react-router-dom";
import { MainLayout } from "./components/Layouts/Main";
import { HomePage } from "./pages/Home";
import { About } from "./pages/About";
import { TranslationProvider } from "./contexts/TranslationContext";
import { RegisterPage } from "./pages/auth/Register";
import { LoginPage as UnifiedLogin } from "./pages/auth/Login";
import { ResetPassword } from "./pages/auth/ResetPassword";
import { StudentDashboard } from "./pages/student/StudentDashboard";
import { StudentCourses } from "./pages/student/StudentCourses";
import { StudentResults } from "./pages/student/StudentResults";
import { StudentProtectedRoute } from "./routes/StudentProtectedRoute";
import { RequestReset } from "./pages/auth/RequestLink";
import VerifyOtp from "./pages/auth/VerifyOtp";
import Tuition from "./pages/Tuition";
import { CourseCategories } from "./pages/cources/category";
import { ContactPage } from "./pages/contactUs";
import CoursesPage from "./pages/cources";
import CourseLessonsPage from "./pages/cources/CourseLessonsPage";
import LessonContentPage from "./pages/cources/LessonContentPage";
import { TestPage } from "./pages/test/TestPage";
import { TestResults } from "./pages/test/TestResults";
import { dashboardRoutes } from "./routes";
import ScrollToTop from "./components/common/ScrollToTop";
import { UserProfilePage } from "./pages/profile";
import { PaymentFlow } from "./components/common/Payment";
import { JobListing } from "./pages/JobListing";
import { JobDetails } from "./pages/JobDetails";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { CertificatesPage } from "./pages/Certificates";
// Exam Portal (Candidate Side)
import ExamLogin from "./pages/exam-portal/ExamLogin";
import ExamPage from "./pages/exam-portal/ExamPage";
import ExamResult from "./pages/exam-portal/ExamResult";
// Exam Admin Portal (Separate Admin System)
import ExamAdminLogin from "./pages/exam-admin/ExamAdminLogin";
import ExamAdminLayout from "./pages/exam-admin/ExamAdminLayout";
import ExamAdminDashboard from "./pages/admin/ExamAdminDashboard";
import Organizations from "./pages/exam-admin/Organizations";
import Exams from "./pages/exam-admin/Exams";
import Candidates from "./pages/exam-admin/Candidates";
import Analytics from "./pages/exam-admin/Analytics";
import Results from "./pages/exam-admin/Results";
import Marking from "./pages/exam-admin/Marking";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { StudentLayout } from "./components/Layouts/Student/StudentLayout";

const DashboardRoutes = () => {
  const element = useRoutes(dashboardRoutes);
  return element;
};

function App() {
  return (
    <TranslationProvider>
      <BrowserRouter>
        <ScrollToTop />
        <ToastContainer position="top-right" autoClose={5000} />
        <Routes>
          {/* Main Dashboard (Existing System) */}
          <Route
            path="/dashboard/*"
            element={
              <ProtectedRoute allowedRoles={["SUPER_ADMIN", "ADMIN", "INSTRUCTOR"]}>
                <DashboardRoutes />
              </ProtectedRoute>
            }
          />

          {/* Exam Portal Routes (Candidate Side - No Layout) */}
          <Route path="/exam-portal/login" element={<ExamLogin />} />
          <Route path="/exam-portal/exam" element={<ExamPage />} />
          <Route path="/exam-portal/result" element={<ExamResult />} />

          {/* Exam Admin Portal (Separate Admin System) */}
          <Route path="/exam-admin/login" element={<ExamAdminLogin />} />
          <Route
            path="/exam-admin/*"
            element={
              <ProtectedRoute allowedRoles={["SUPER_ADMIN", "ADMIN", "INSTRUCTOR", "EXAMINER"]}>
                <ExamAdminLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<ExamAdminDashboard />} />
            <Route path="organizations" element={<Organizations />} />
            <Route path="exams" element={<Exams />} />
            <Route path="candidates" element={<Candidates />} />
            <Route path="marking" element={<Marking />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="results" element={<Results />} />
            <Route path="*" element={<Navigate to="/exam-admin/dashboard" replace />} />
          </Route>

          {/* Main Website Routes */}
          <Route
            element={
              <MainLayout>
                <Outlet />
              </MainLayout>
            }
          >
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<About />} />
            <Route path="/tuition" element={<Tuition />} />
            <Route
              path="/profile"
              element={
                <ProtectedRoute allowedRoles={["SUPER_ADMIN", "ADMIN", "INSTRUCTOR", "STUDENT", "USER"]}>
                  <UserProfilePage />
                </ProtectedRoute>
              }
            />


            {/* Updated course routes */}
            <Route path="/courses" element={<Navigate to="/courses/all" replace />} />
            <Route path="/courses/all" element={<CoursesPage />} />
            <Route path="/courses/categories" element={<CourseCategories />} />
            <Route path="/courses/category/:categoryId" element={<CoursesPage />} />
            <Route path="/courses/:courseId/lessons" element={<CourseLessonsPage />} />
            <Route path="/test/:testId" element={<TestPage />} />
            <Route path="/test/:testId/results" element={<TestResults />} />
            <Route path="/lessons/:lessonId" element={<LessonContentPage />} />
            <Route path="/payment-flow/:amount/:period" element={<PaymentFlow />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/job-listing" element={<JobListing />} />
            <Route path="/job-listing/:slug" element={<JobDetails />} />
            <Route path="/certificates" element={<CertificatesPage />} />
            <Route path="/certificates/:id" element={<CertificatesPage />} />
          </Route>

          {/* Authentication Routes (Standalone to avoid layout shifts) */}
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<UnifiedLogin />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/request-link" element={<RequestReset />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
          {/* Student Portal Routes */}
          <Route
            path="/student"
            element={
              <StudentProtectedRoute>
                <StudentLayout />
              </StudentProtectedRoute>
            }
          >
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="courses" element={<StudentCourses />} />
            <Route path="results" element={<StudentResults />} />
            {/* Add more student routes here */}
            <Route path="*" element={<Navigate to="/student/dashboard" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </TranslationProvider>
  );
}

export default App;
