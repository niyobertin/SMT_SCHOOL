import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import { DashboardHome } from '../Dashboards/DashboardHome';
import { UsersSection } from '../Dashboards/sections/Users';
import { SubscriptionsSection } from '../Dashboards/sections/Subscriptions';
import { CoursesSection } from '../Dashboards/sections/Courses';
import { Lessons } from '../Dashboards/sections/Lessons';
import { LessonContent } from '../Dashboards/sections/Content';
import { Tests } from '../Dashboards/sections/Tests';
import { JobBoard } from '../Dashboards/sections/Jobs';

// Exam Admin Pages
const ExamAdminDashboard = lazy(() => import('../pages/admin/ExamAdminDashboard'));
const Organizations = lazy(() => import('../pages/exam-admin/Organizations'));
const Academic = lazy(() => import('../pages/exam-admin/Academic'));
const Subjects = lazy(() => import('../pages/exam-admin/Subjects'));
const Grades = lazy(() => import('../pages/exam-admin/Grades'));
const Assignments = lazy(() => import('../pages/exam-admin/Assignments'));
const Exams = lazy(() => import('../pages/exam-admin/Exams'));
const Candidates = lazy(() => import('../pages/exam-admin/Candidates'));
const Marking = lazy(() => import('../pages/exam-admin/Marking'));
const Analytics = lazy(() => import('../pages/exam-admin/Analytics'));
const Results = lazy(() => import('../pages/exam-admin/Results'));

export const dashboardRoutes: RouteObject[] = [
  {
    index: true,
    element: <DashboardHome />,
  },
  {
    path: 'users',
    element: <UsersSection />,
  },
  {
    path: 'subscriptions',
    element: <SubscriptionsSection />,
  },
  {
    path: 'tests',
    element: <Tests />,
  },
  {
    path: 'content',
    element: <JobBoard />,
  },
  {
    path: 'courses',
    children: [
      {
        index: true,
        element: <CoursesSection />,
      },
      {
        path: ':courseId',
        children: [
          {
            index: true,
            element: <Lessons />,
          },
          {
            path: 'lessons/:lessonId',
            element: <LessonContent />,
          },
        ],
      },
    ],
  },
  // Unified Exam Admin Routes under /dashboard
  { path: 'exam-admin', element: <ExamAdminDashboard /> },
  { path: 'organizations', element: <Organizations /> },
  { path: 'academic', element: <Academic /> },
  { path: 'subjects', element: <Subjects /> },
  { path: 'grades', element: <Grades /> },
  { path: 'assignments', element: <Assignments /> },
  { path: 'exams', element: <Exams /> },
  { path: 'candidates', element: <Candidates /> },
  { path: 'marking', element: <Marking /> },
  { path: 'analytics', element: <Analytics /> },
  { path: 'results', element: <Results /> },
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />,
  },
];
