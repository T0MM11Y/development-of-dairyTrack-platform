// src/controllers/feedItemController.js
import { API_URL4 } from "../../api/apiController.js";

const getAllFeedItems = async (params = {}) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = user.token;

  const response = await fetch(`${API_URL4}/dailyFeedItem?${new URLSearchParams(params).toString()}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Gagal mengambil data item pakan");
  }
  return result; // Return array directly as per backend
};

const getFeedItemById = async (id) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = user.token;

  const response = await fetch(`${API_URL4}/dailyFeedItem/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Gagal mengambil item pakan");
  }
  return result; // Return result (contains data object)
};

const addFeedItem = async (data) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = user.token;

  const response = await fetch(`${API_URL4}/dailyFeedItem`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Gagal menambahkan item pakan");
  }
  return result; // Return result (contains success, message, data)
};

const updateFeedItem = async (id, data) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = user.token;

  const response = await fetch(`${API_URL4}/dailyFeedItem/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Gagal memperbarui item pakan");
  }
  return result; // Return result (contains success, message, data)
};

const deleteFeedItem = async (id) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = user.token;

  const response = await fetch(`${API_URL4}/dailyFeedItem/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Gagal menghapus item pakan");
  }
  return result; // Return result (contains success, message)
};

const bulkUpdateFeedItems = async (data) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = user.token;

  const response = await fetch(`${API_URL4}/dailyFeedItem/bulk-update`, {
    method: "POST", // Match backend router (POST, not PUT)
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Gagal memperbarui item pakan secara massal");
  }
  return result; // Return result (contains success, message, results)
};

const getFeedItemsByDailyFeedId = async (dailyFeedId) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = user.token;

  const response = await fetch(`${API_URL4}/dailyFeedItem/daily-feeds/${dailyFeedId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Gagal mengambil item pakan untuk sesi harian");
  }
  return result; // Return array directly as per backend
};

const getFeedUsageByDate = async (params = {}) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = user.token;

  const response = await fetch(`${API_URL4}/dailyFeedItem/feedUsage?${new URLSearchParams(params).toString()}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Gagal mengambil data penggunaan pakan");
  }
  return result; // Return result (contains success, message, data)
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