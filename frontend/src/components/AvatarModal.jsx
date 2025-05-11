import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faCamera } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const AvatarModal = ({ isOpen, onClose, onSuccess }) => {
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Kiểm tra kích thước file (tối đa 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError("Kích thước ảnh đại diện không được vượt quá 2MB.");
      return;
    }

    // Kiểm tra loại file
    if (!file.type.startsWith("image/")) {
      setError("Vui lòng chọn file hình ảnh.");
      return;
    }

    setAvatar(file);
    setError("");

    // Hiển thị ảnh xem trước
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!avatar) {
      setError("Vui lòng chọn ảnh đại diện");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");

      // Tạo FormData object
      const formData = new FormData();
      formData.append("avatar", avatar);

      // Upload ảnh lên Cloudinary
      const uploadResponse = await axios.post(`${API_URL}/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
        timeout: 30000, // Thêm timeout 30 giây
      });

      console.log("Upload response:", uploadResponse.data);

      if (!uploadResponse.data.url) {
        console.error("Upload response:", uploadResponse.data);
        throw new Error("Không nhận được URL ảnh từ server");
      }

      // Cập nhật avatar trong profile
      const profileResponse = await axios.patch(
        `${API_URL}/users/profile`,
        {
          avatar: uploadResponse.data.url,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Profile update response:", profileResponse.data);

      onSuccess(uploadResponse.data.url);
      onClose();
    } catch (err) {
      console.error("Lỗi khi cập nhật avatar:", err);
      setError(
        err.response?.data?.message ||
          "Không thể cập nhật avatar. Vui lòng thử lại sau."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="avatar-modal">
        <div className="modal-header">
          <h2>Cập nhật ảnh đại diện</h2>
          <button className="close-button" onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div className="modal-content">
          {error && <div className="error-message">{error}</div>}

          <div className="avatar-preview">
            {avatarPreview ? (
              <img src={avatarPreview} alt="Avatar preview" />
            ) : (
              <div className="avatar-placeholder">
                <FontAwesomeIcon icon={faCamera} />
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} encType="multipart/form-data">
            <div className="form-group">
              <label htmlFor="avatar-input" className="upload-button">
                Chọn ảnh
              </label>
              <input
                type="file"
                id="avatar-input"
                name="avatar"
                accept="image/*"
                onChange={handleAvatarChange}
                style={{ display: "none" }}
              />
            </div>

            <div className="modal-actions">
              <button type="button" onClick={onClose} disabled={loading}>
                Hủy
              </button>
              <button type="submit" disabled={loading || !avatar}>
                {loading ? "Đang cập nhật..." : "Cập nhật"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AvatarModal;
