import { BrowserRouter, Routes, Route, Outlet, Navigate } from "react-router-dom";
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
import CourseLessonsPage from "./pages/courses/CourseLessonsPage";
import LessonContentPage from "./pages/courses/LessonContentPage";

function App() {
  return (
    <TranslationProvider>
      <BrowserRouter>
        <Routes>
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
            
            {/* Updated course routes */}
            <Route path="/courses" element={<Navigate to="/courses/all" replace />} />
            <Route path="/courses/all" element={<CoursesPage />} />
            <Route path="/courses/categories" element={<CourseCategories />} />
            <Route path="/courses/category/:categoryId" element={<CoursesPage />} />
            <Route path="/courses/:courseId/lessons" element={<CourseLessonsPage />} />
            <Route path="/lessons/:lessonId" element={<LessonContentPage />} />
            
            <Route path="/contact" element={<ContactPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </TranslationProvider>
  );
}

export default App;
