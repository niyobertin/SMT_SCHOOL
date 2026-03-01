import type { RouteObject } from "react-router-dom";
import { Navigate, Outlet } from "react-router-dom";
import { lazy, Suspense } from "react";
import { AuthGuard } from "../components/common/AuthGuard";

// Layouts
import { MainLayout } from "../components/Layouts/Main";
import { BaseSidebarLayout } from "../components/common/BaseSidebarLayout";
import { allNavItems } from "../layouts/navConfigs/allNavItems";

// Pages - Auth
import { LoginPage } from "../pages/auth/Login";
import { RegisterPage } from "../pages/auth/Register";
const ResetPassword = lazy(() => import("../pages/auth/ResetPassword").then(m => ({ default: m.ResetPassword })));
const RequestReset = lazy(() => import("../pages/auth/RequestLink").then(m => ({ default: m.RequestReset })));
const VerifyOtp = lazy(() => import("../pages/auth/VerifyOtp"));

// Pages - General
import { HomePage } from "../pages/Home";
const About = lazy(() => import("../pages/About").then(m => ({ default: m.About })));
const Tuition = lazy(() => import("../pages/Tuition"));
const ContactPage = lazy(() => import("../pages/contactUs").then(m => ({ default: m.ContactPage })));

// Pages - Courses
const CoursesPage = lazy(() => import("../pages/cources"));
const CourseCategories = lazy(() => import("../pages/cources/category").then(m => ({ default: m.CourseCategories })));
const CourseLessonsPage = lazy(() => import("../pages/cources/CourseLessonsPage"));
const LessonContentPage = lazy(() => import("../pages/cources/LessonContentPage"));

const ExamPortalLogin = lazy(() => import("../pages/exam-portal/ExamLogin"));
const ExamPortalPage = lazy(() => import("../pages/exam-portal/ExamPage"));
const ExamPortalResult = lazy(() => import("../pages/exam-portal/ExamResult"));

// Pages - Profiles & Payments
import { UserProfilePage } from "../pages/profile";
const TestPage = lazy(() => import("../pages/test/TestPage").then(m => ({ default: m.TestPage })));
const TestResults = lazy(() => import("../pages/test/TestResults").then(m => ({ default: m.TestResults })));
const PaymentFlow = lazy(() => import("../components/common/Payment").then(m => ({ default: m.PaymentFlow })));
const JobListing = lazy(() => import("../pages/JobListing").then(m => ({ default: m.JobListing })));
const JobDetails = lazy(() => import("../pages/JobDetails").then(m => ({ default: m.JobDetails })));



// Existing Dashboard Routes
import { dashboardRoutes } from "./index";

// Loading fallback
const PageLoader = () => (
    <div className="flex items-center justify-center min-vh-100 py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
);

export const routesConfig: RouteObject[] = [
    // Main Website Routes
    {
        path: "/",
        element: (
            <MainLayout>
                <Suspense fallback={<PageLoader />}>
                    <Outlet />
                </Suspense>
            </MainLayout>
        ),
        children: [
            { index: true, element: <HomePage /> },
            { path: "about", element: <About /> },
            { path: "tuition", element: <Tuition /> },
            { path: "contact", element: <ContactPage /> },
            { path: "login", element: <LoginPage /> },
            { path: "register", element: <RegisterPage /> },
            { path: "reset-password", element: <ResetPassword /> },
            { path: "request-link", element: <RequestReset /> },
            { path: "verify-otp", element: <VerifyOtp /> },
            {
                path: "profile",
                element: (
                    <AuthGuard allowedRoles={["SUPER_ADMIN", "ADMIN", "INSTRUCTOR", "STUDENT", "USER"]}>
                        <UserProfilePage />
                    </AuthGuard>
                )
            },
            {
                path: "courses",
                children: [
                    { index: true, element: <Navigate to="all" replace /> },
                    { path: "all", element: <CoursesPage /> },
                    { path: "categories", element: <CourseCategories /> },
                    { path: "category/:categoryId", element: <CoursesPage /> },
                    { path: ":courseId/lessons", element: <CourseLessonsPage /> },
                ]
            },
            { path: "test/:testId", element: <TestPage /> },
            { path: "test/:testId/results", element: <TestResults /> },
            { path: "lessons/:lessonId", element: <LessonContentPage /> },
            { path: "payment-flow/:amount/:period", element: <PaymentFlow /> },
            { path: "job-listing", element: <JobListing /> },
            { path: "job-listing/:slug", element: <JobDetails /> },
        ]
    },
    // Dashboard Routes (Integrated unified structure)
    {
        path: "/dashboard",
        element: (
            <AuthGuard allowedRoles={["SUPER_ADMIN", "ADMIN", "INSTRUCTOR", "EXAMINER"]}>
                <BaseSidebarLayout navItems={allNavItems} portalName="SMT School">
                    <Suspense fallback={<PageLoader />}>
                        <Outlet />
                    </Suspense>
                </BaseSidebarLayout>
            </AuthGuard>
        ),
        children: dashboardRoutes
    },
    // Redirects for legacy routes
    { path: "/exam-admin", element: <Navigate to="/dashboard" replace /> },
    { path: "/exam-admin/*", element: <Navigate to="/dashboard" replace /> },
    { path: "/dashbaord", element: <Navigate to="/dashboard" replace /> }, // Patch potential typos
    { path: "/dashbord", element: <Navigate to="/dashboard" replace /> },
    { path: "/exam-admin/login", element: <Navigate to="/login" replace /> },
    // Exam Portal (Candidate)
    {
        path: "/exam-portal",
        children: [
            { path: "login", element: <ExamPortalLogin /> },
            { path: "exam", element: <ExamPortalPage /> },
            { path: "result", element: <ExamPortalResult /> },
        ]
    },

    {
        path: "*",
        element: <Navigate to="/" replace />
    }
];
