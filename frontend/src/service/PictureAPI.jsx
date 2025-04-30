import axios from "axios";

const API_URL = "http://localhost:4000";

export const uploadPictures = async (imageFiles) => {
  const formData = new FormData();
  imageFiles.forEach((file) => {
    formData.append("picture", file); // 'files' là key
  });

  try {
    const response = await axios.post(`${API_URL}/picture`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    if (!response) {
      const error = await response.text();
      throw new Error(error || "Upload failed");
    }

    return response.data;
  } catch (err) {
    console.error("API Error (uploadPictures):", err.message);
    throw err;
  }
};

export const getPictureByLink = async (link) => {
  try {
    const response = await axios.get(`${API_URL}/picture`, {
      params: { link },
    });
    return response.data;
  } catch (err) {
    console.error("API Error (uploadPictures):", err.message);
    throw err;
  }
};

export const deletePicture = async (pictureId) => {
  try {
    const response = await axios.delete(`${API_URL}/picture/${pictureId}`);
    console.log("Xóa thành công");
    return response.data;
  } catch (err) {
    console.error("API Error (uploadPictures):", err.message);
    throw err;
  }
};
