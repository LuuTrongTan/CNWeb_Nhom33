import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <nav className="flex justify-between bg-gray-800 p-4 text-white">
      <Link to="/" className="text-lg font-bold">Trang Chủ</Link>
      <div>
        {isAuthenticated ? (
          <>
            {user.role === 'admin' ? (
              <Link to="/admin" className="mr-4">Quản lý Người Dùng</Link>
            ) : (
              <Link to="/profile" className="mr-4">Hồ sơ</Link>
            )}
            <button onClick={logout} className="bg-red-500 px-4 py-2 rounded-md">
              Đăng xuất
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="mr-4">Đăng nhập</Link>
            <Link to="/register">Đăng ký</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
