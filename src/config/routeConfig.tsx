import { Navigate, type RouteObject } from 'react-router-dom';
import { OverviewPage } from '../pages/OverviewPage';

export const routeConfig: RouteObject[] = [
  // Public Routes
  {
    path: '/',
    element: <Navigate to='markets' replace />
  },
  {
    path: 'markets',
    children: [
      {
        index: true,
        element: <Navigate to='overview' replace />
      },
      {
        path: 'overview',
        element: <OverviewPage />
      }
    ]
  }
];
