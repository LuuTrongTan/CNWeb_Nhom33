import { useState } from 'react';

const VerifyEmailModal = ({ onClose, email }) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = async () => {
    setLoading(true);
    setError(''); // Xóa lỗi cũ trước khi gửi
    try {
      const response = await fetch('/api/users/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`, // Thêm token để xác thực
        },
        body: JSON.stringify({ email, code }),
      });

      const data = await response.json();
      if (response.ok) {
        alert('Xác thực thành công!');
        onClose(); // Đóng modal thay vì reload toàn bộ trang
        window.location.reload(); // Reload để cập nhật trạng thái user
      } else {
        setError(data.message || 'Xác thực thất bại.');
      }
    } catch (error) {
      setError('Lỗi xác thực. Vui lòng thử lại.');
      console.error('Lỗi xác thực:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded shadow-lg">
        <h2 className="text-xl mb-4">Nhập mã xác thực</h2>
        {error && <div className="text-red-500 mb-4">{error}</div>} {/* Hiển thị lỗi */}
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="border p-2 w-full mb-4"
          placeholder="Nhập mã xác thực"
          disabled={loading}
        />
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-4 py-2 rounded"
            disabled={loading}
          >
            Hủy
          </button>
          <button
            onClick={handleVerify}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            {loading ? 'Đang xử lý...' : 'Xác nhận'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailModal;