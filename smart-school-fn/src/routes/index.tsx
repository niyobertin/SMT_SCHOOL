import type { RouteObject } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import { Dashboard } from '../Dashboards/Dashboard';
import { DashboardHome } from '../Dashboards/DashboardHome';
import { UsersSection } from '../Dashboards/sections/Users';
import { SubscriptionsSection } from '../Dashboards/sections/Subscriptions';
import { CoursesSection } from '../Dashboards/sections/Courses';
import { Lessons } from '../Dashboards/sections/Lessons';
import { LessonContent } from '../Dashboards/sections/Content';
import { Tests } from '../Dashboards/sections/Tests';
import { JobBoard } from '../Dashboards/sections/Jobs';
import { AcademicSection } from '../Dashboards/sections/Academic/AcademicSection';
import { CourseAssignmentSection } from '../Dashboards/sections/Academic/CourseAssignmentSection';
import ExamAdminDashboard from '../pages/admin/ExamAdminDashboard';

import { Assessments } from '../Dashboards/sections/Assessments';

export const dashboardRoutes: RouteObject[] = [
  {
    path: '/',
    element: <Dashboard />,
    children: [
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
      {
        path: 'academic',
        element: <AcademicSection />,
      },
      {
        path: 'assignments',
        element: <CourseAssignmentSection />,
      },
      {
        path: 'assessments',
        element: <Assessments />,
      },
      {
        path: 'exam-admin',
        element: <ExamAdminDashboard />,
      },
      {
        path: '*',
        element: <Navigate to="/dashboard" replace />,
      },
    ],
  },
];
