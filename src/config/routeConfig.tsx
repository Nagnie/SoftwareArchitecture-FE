import { Navigate, type RouteObject } from 'react-router-dom';
import { OverviewPage } from '../pages/OverviewPage';
import LoginPage from '@/pages/LoginPage';
import SignupPage from '@/pages/SignupPage';
import ProfilePage from '@/pages/ProfilePage';
import { PriceChartPage } from '@/pages/PriceChartPage';
import AdminPage from '@/pages/AdminPage';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminRoute from '@/components/AdminRoute';

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
      },
      {
        path: 'price-chart/:baseAsset/:tickerSymbol',
        element: <PriceChartPage />
      }
    ]
  },
  // Protected Routes
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: 'profile',
        element: <ProfilePage />
      }
    ]
  },
  // Admin Routes
  {
    element: <AdminRoute />,
    children: [
      {
        path: 'admin',
        element: <AdminPage />
      }
    ]
  }
];
