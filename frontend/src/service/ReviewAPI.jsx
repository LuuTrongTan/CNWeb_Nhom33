import axios from "axios";

const API_URL = "http://localhost:4000";

export const getReviewByProduct = async (productId, page) => {
  try {
    const response = await axios.get(`${API_URL}/review/product/${productId}`, {
      params: {
        page,
        limit: 10,
        sortBy: "createdAt:desc",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy reviews:", error);
    throw error;
  }
};

export const getReviewById = async (reviewId) => {
  try {
    const response = await axios.get(`${API_URL}/review?reviewId=${reviewId}`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy review:", error);
    throw error;
  }
};

export const createReview = async (reviewData) => {
  try {
    const response = await axios.post(`${API_URL}/review`, reviewData, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi tạo review:", error);
    throw error;
  }
};

export const updateReviewById = async (reviewId, bodyData) => {
  try {
    const response = await axios.patch(
      `${API_URL}/review?reviewId=${reviewId}`,
      bodyData,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Lỗi khi cập nhật danh mục:", error);
    throw error;
  }
};

export const deleteReviewById = async (reviewId, userId) => {
  try {
    const response = await axios.delete(
      `${API_URL}/review?reviewId=${reviewId}&userId=${userId}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Lỗi khi xóa review:", error);
    throw error;
  }
};

export const createFeedBack = async (reviewId, userId, content) => {
  try {
    const response = await axios.post(
      `${API_URL}/review/${reviewId}/feedback`,
      { user: userId, content: content },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Lỗi khi tạo feedback:", error);
    throw error;
  }
};

export const deleteFeedbackById = async (feedbackId, reviewId) => {
  try {
    const response = await axios.delete(
      `${API_URL}/review/${reviewId}/feedback/${feedbackId}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Lỗi khi xóa feedback:", error);
    throw error;
  }
};

export const updateFeedbackById = async (feedbackId, reviewId, bodyData) => {
  try {
    const response = await axios.patch(
      `${API_URL}/review/${reviewId}/feedback/${feedbackId}`,
      bodyData,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Lỗi khi xóa feedback:", error);
    throw error;
  }
};
