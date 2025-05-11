import React, { useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faSpinner } from '@fortawesome/free-solid-svg-icons';
import '../styles/css/Auth/EmailVerificationModal.css';

const EmailVerificationModal = ({ isOpen, onClose, onSuccess }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/auth/verify-email', 
        { code },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.message === 'Xác thực email thành công!') {
        onSuccess();
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi xác thực mã');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setSendingCode(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      await axios.post('/auth/request-email-verification', 
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      alert('Mã xác thực mới đã được gửi đến email của bạn');
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi gửi mã');
    } finally {
      setSendingCode(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>
          <FontAwesomeIcon icon={faTimes} />
        </button>

        <h2>Xác thực email</h2>
        <p>Vui lòng nhập mã xác thực 6 số đã được gửi đến email của bạn</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Nhập mã xác thực"
              maxLength={6}
              pattern="[0-9]*"
              required
            />
          </div>

          <div className="modal-actions">
            <button 
              type="button" 
              className="resend-button"
              onClick={handleResendCode}
              disabled={sendingCode}
            >
              {sendingCode ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} spin /> Đang gửi...
                </>
              ) : (
                'Gửi lại mã'
              )}
            </button>

            <button 
              type="submit" 
              className="verify-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} spin /> Đang xác thực...
                </>
              ) : (
                'Xác thực'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmailVerificationModal; 