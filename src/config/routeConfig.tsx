import { Navigate, type RouteObject } from 'react-router-dom';
import { OverviewPage } from '../pages/OverviewPage';
import LoginPage from '@/pages/LoginPage';
import SignupPage from '@/pages/SignupPage';
import ProfilePage from '@/pages/ProfilePage';

export const routeConfig: RouteObject[] = [
  // Public Routes
  {
    path: '/',
    element: <Navigate to='markets' replace />
  },
  {
    path: '/',
    children: [
      {
        path: 'login',
        element: <LoginPage />
      },
      {
        path: 'signup',
        element: <SignupPage />
      }
    ]
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
  },
  // Protected Routes
  {
    path: 'profile',
    element: <ProfilePage />
  }
];
