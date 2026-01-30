import { Navigate, useLocation } from 'react-router-dom';
import { ReactNode } from 'react';

// Mock authentication check - in a real app, this would check actual auth state
// For demo purposes, we'll use localStorage to simulate logged in state
const useAuth = () => {
  // Check if user is "logged in" via localStorage
  const isAuthenticated = localStorage.getItem('isLoggedIn') === 'true';
  return { isAuthenticated };
};

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to auth page with the return url
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
