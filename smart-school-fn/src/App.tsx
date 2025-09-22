import { BrowserRouter, Routes, Route, Navigate, useRoutes, Outlet } from "react-router-dom";
import { MainLayout } from "./components/Layouts/Main";
import { HomePage } from "./pages/Home";
import { About } from "./pages/About";
import { TranslationProvider } from "./contexts/TranslationContext";
import { RegisterPage } from "./pages/auth/Register";
import { LoginPage } from "./pages/auth/Login";
import { ResetPassword } from "./pages/auth/ResetPassword";
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

const DashboardRoutes = () => {
  const element = useRoutes(dashboardRoutes);
  return element;
};

function App() {
  return (
    <TranslationProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/dashboard/*" element={<DashboardRoutes />} />
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
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/request-link" element={<RequestReset />} />
            <Route path="/verify-otp" element={<VerifyOtp />} />
            <Route path="/profile" element={<UserProfilePage />} />

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
          </Route>
        </Routes>
      </BrowserRouter>
    </TranslationProvider>
  );
}

export default App;
