import { API_URL4 } from "../../api/apiController.js";

const getAllDailyFeeds = async (params = {}) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = user.token;
  const role = user.role?.toLowerCase(); // e.g., "admin", "supervisor", "farmer"
  const userId = user.id; // User ID for farmer filtering

  if (!token) {
    throw new Error("Token tidak ditemukan. Silakan login ulang.");
  }

  // For farmers, add user_id to filter cows they are associated with
  if (role === "farmer" && userId) {
    params.user_id = userId;
  }

  const response = await fetch(
    `${API_URL4}/dailyFeedSchedule?${new URLSearchParams(params).toString()}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Gagal mengambil data jadwal pakan");
  }

  return result;
};

const getDailyFeedById = async (id) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = user.token;
  const role = user.role?.toLowerCase();
  const userId = user.id;

  if (!token) {
    throw new Error("Token tidak ditemukan. Silakan login ulang.");
  }

  const response = await fetch(`${API_URL4}/dailyFeedSchedule/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Gagal mengambil jadwal pakan");
  }

  // For farmers, verify that the daily feed belongs to a cow they are associated with
  if (role === "farmer" && userId) {
    if (!result.data || result.data.user_id !== userId) {
      throw new Error("Akses ditolak: Anda tidak memiliki izin untuk melihat jadwal pakan ini.");
    }
  }

  return result;
};

const createDailyFeed = async (data) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = user.token;

  const response = await fetch(`${API_URL4}/dailyFeedSchedule`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Gagal membuat jadwal pakan");
  }
  return result;
};

const updateDailyFeed = async (id, data) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = user.token;

  const response = await fetch(`${API_URL4}/dailyFeedSchedule/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Gagal memperbarui jadwal pakan");
  }
  return result;
};

const deleteDailyFeed = async (id) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = user.token;

  const response = await fetch(`${API_URL4}/dailyFeedSchedule/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Gagal menghapus jadwal pakan");
  }
  return result;
};

export { getAllDailyFeeds, getDailyFeedById, createDailyFeed, updateDailyFeed, deleteDailyFeed };