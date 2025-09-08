import type { RouteObject } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import { Dashboard } from '../Dashboards/Dashboard';
import { DashboardHome } from '../Dashboards/DashboardHome';
import { UsersSection } from '../Dashboards/sections/Users';
import { SubscriptionsSection } from '../Dashboards/sections/Subscriptions';
import { CoursesSection } from '../Dashboards/sections/Courses';
import { Lessons } from '../Dashboards/sections/Lessons';
import { LessonContent } from '../Dashboards/sections/Content';

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
        path: '*',
        element: <Navigate to="/dashboard" replace />,
      },
    ],
  },
];
