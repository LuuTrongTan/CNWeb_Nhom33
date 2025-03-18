import React, { useEffect, useState } from 'react';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/users/admin/users', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setUsers(data);
        } else {
          console.error('Lỗi dữ liệu:', data);
          setUsers([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Lỗi khi tải danh sách người dùng:', err);
        setUsers([]);
        setLoading(false);
      });
  }, []);
  

  if (loading) return <p>Đang tải...</p>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Quản lý tài khoản</h1>
      {users.length > 0 ? (
        <ul>
          {users.map((user) => (
            <li key={user._id} className="p-2 border-b">
              {user.name} ({user.email}) - {user.role}
            </li>
          ))}
        </ul>
      ) : (
        <p>Không có người dùng nào.</p>
      )}
    </div>
  );
};

export default AdminDashboard;
