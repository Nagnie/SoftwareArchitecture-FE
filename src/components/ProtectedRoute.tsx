import { useAuth } from '@/context/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';

export function ProtectedRoute() {
  const { token, isLoading } = useAuth();

  if (isLoading) {
    // You could put a loading spinner here
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!token) {
    return <Navigate to="/auth" replace />;
  }

  return <Outlet />;
}
