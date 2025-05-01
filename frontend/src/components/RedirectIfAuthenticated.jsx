import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const RedirectIfAuthenticated = () => {
  const { user, isAuthenticated } = useAuth();

  if (isAuthenticated && user) {
    return <Navigate to={user.role === 'admin' ? "/admin" : "/profile"} replace />;
  }

  return <Outlet />;
};

export default RedirectIfAuthenticated;
