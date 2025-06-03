import { API_URL4 } from "../../api/apiController.js";

const getAllFeedItems = async (params = {}) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = user.token || null;

  try {
    const response = await fetch(`${API_URL4}/dailyFeedItem?${new URLSearchParams(params).toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await response.json();
    return response.ok
      ? result
      : { success: false, message: result.message || "Gagal mengambil data item pakan" };
  } catch (error) {
    console.error("getAllFeedItems - Error:", error);
    return { success: false, message: "Terjadi kesalahan saat mengambil data item pakan" };
  }
};

const getFeedItemsByDailyFeedId = async (dailyFeedId) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = user.token || null;

  try {
    const response = await fetch(`${API_URL4}/dailyFeedItem?daily_feed_id=${dailyFeedId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await response.json();
    return response.ok
      ? result
      : { success: false, message: result.message || "Gagal mengambil item pakan untuk sesi harian" };
  } catch (error) {
    console.error("getFeedItemsByDailyFeedId - Error:", error);
    return { success: false, message: "Terjadi kesalahan saat mengambil item pakan untuk sesi harian" };
  }
};

const getFeedItemById = async (id) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = user.token || null;

  try {
    const response = await fetch(`${API_URL4}/dailyFeedItem/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await response.json();
    return response.ok
      ? result
      : { success: false, message: result.message || "Gagal mengambil item pakan" };
  } catch (error) {
    console.error("getFeedItemById - Error:", error);
    return { success: false, message: "Terjadi kesalahan saat mengambil item pakan" };
  }
};

const addFeedItem = async (data) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = user.token || null;

  try {
    const response = await fetch(`${API_URL4}/dailyFeedItem`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    return response.ok
      ? result
      : { success: false, message: result.message || "Gagal menambahkan item pakan" };
  } catch (error) {
    console.error("addFeedItem - Error:", error);
    return { success: false, message: "Terjadi kesalahan saat menambahkan item pakan" };
  }
};

const updateFeedItem = async (id, data) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = user.token || null;

  try {
    const response = await fetch(`${API_URL4}/dailyFeedItem/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    return response.ok
      ? result
      : { success: false, message: result.message || "Gagal memperbarui item pakan" };
  } catch (error) {
    console.error("updateFeedItem - Error:", error);
    return { success: false, message: "Terjadi kesalahan saat memperbarui item pakan" };
  }
};

const deleteFeedItem = async (id) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = user.token || null;

  try {
    const response = await fetch(`${API_URL4}/dailyFeedItem/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await response.json();
    return response.ok
      ? result
      : { success: false, message: result.message || "Gagal menghapus item pakan" };
  } catch (error) {
    console.error("deleteFeedItem - Error:", error);
    return { success: false, message: "Terjadi kesalahan saat menghapus item pakan" };
  }
};

const bulkUpdateFeedItems = async (data) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = user.token || null;

  try {
    const response = await fetch(`${API_URL4}/dailyFeedItem/bulk-update`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    return response.ok
      ? result
      : { success: false, message: result.message || "Gagal memperbarui item pakan secara massal" };
  } catch (error) {
    console.error("bulkUpdateFeedItems - Error:", error);
    return { success: false, message: "Terjadi kesalahan saat memperbarui item pakan secara massal" };
  }
};

const getFeedUsageByDate = async (params = {}) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = user.token || null;

  try {
    const response = await fetch(`${API_URL4}/dailyFeedItem/feedUsage?${new URLSearchParams(params).toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await response.json();
    return response.ok
      ? result
      : { success: false, message: result.message || "Gagal mengambil data penggunaan pakan" };
  } catch (error) {
    console.error("getFeedUsageByDate - Error:", error);
    return { success: false, message: "Terjadi kesalahan saat mengambil data penggunaan pakan" };
  }
};

export {
  getAllFeedItems,
  getFeedItemById,
  addFeedItem,
  updateFeedItem,
  deleteFeedItem,
  bulkUpdateFeedItems,
  getFeedItemsByDailyFeedId,
  getFeedUsageByDate,
};