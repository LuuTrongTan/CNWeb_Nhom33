import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const RedirectIfAuthenticated = () => {
  const { user, isAuthenticated, loading, error } = useAuth();

  if (loading) {
    return <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
    </div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen">
      <div className="text-red-500">Có lỗi xảy ra: {error.message}</div>
    </div>;
  }

  if (isAuthenticated) {
    return <Navigate to={user.role === 'admin' ? "/admin" : "/profile"} replace />;
  }

  return <Outlet />;
};

export default RedirectIfAuthenticated;
