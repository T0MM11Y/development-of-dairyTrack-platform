import { API_URL4 } from "../../api/apiController.js";

const getAllDailyFeeds = async (params = {}) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = user.token || null;
  const role = user.role?.toLowerCase();
  const userId = user.id;

  if (role === "farmer" && userId) {
    params.user_id = userId;
  }

  try {
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
    return response.ok
      ? result
      : { success: false, message: result.message || "Gagal mengambil data jadwal pakan" };
  } catch (error) {
    console.error("getAllDailyFeeds - Error:", error);
    return { success: false, message: "Terjadi kesalahan saat mengambil data jadwal pakan" };
  }
};

const getDailyFeedById = async (id) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = user.token || null;
  const role = user.role?.toLowerCase();
  const userId = user.id;

  try {
    const response = await fetch(`${API_URL4}/dailyFeedSchedule/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await response.json();
    if (!response.ok) {
      return { success: false, message: result.message || "Gagal mengambil jadwal pakan" };
    }

    if (role === "farmer" && userId && (!result.data || result.data.user_id !== userId)) {
      return { success: false, message: "Akses ditolak: Anda tidak memiliki izin untuk melihat jadwal pakan ini" };
    }

    return result;
  } catch (error) {
    console.error("getDailyFeedById - Error:", error);
    return { success: false, message: "Terjadi kesalahan saat mengambil jadwal pakan" };
  }
};

const createDailyFeed = async (data) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = user.token || null;

  try {
    const response = await fetch(`${API_URL4}/dailyFeedSchedule`, {
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
      : { success: false, message: result.message || "Gagal membuat jadwal pakan" };
  } catch (error) {
    console.error("createDailyFeed - Error:", error);
    return { success: false, message: "Terjadi kesalahan saat membuat jadwal pakan" };
  }
};

const updateDailyFeed = async (id, data) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = user.token || null;

  try {
    const response = await fetch(`${API_URL4}/dailyFeedSchedule/${id}`, {
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
      : { success: false, message: result.message || "Gagal memperbarui jadwal pakan" };
  } catch (error) {
    console.error("updateDailyFeed - Error:", error);
    return { success: false, message: "Terjadi kesalahan saat memperbarui jadwal pakan" };
  }
};

const deleteDailyFeed = async (id) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = user.token || null;

  try {
    const response = await fetch(`${API_URL4}/dailyFeedSchedule/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await response.json();
    return response.ok
      ? result
      : { success: false, message: result.message || "Gagal menghapus jadwal pakan" };
  } catch (error) {
    console.error("deleteDailyFeed - Error:", error);
    return { success: false, message: "Terjadi kesalahan saat menghapus jadwal pakan" };
  }
};

export { getAllDailyFeeds, getDailyFeedById, createDailyFeed, updateDailyFeed, deleteDailyFeed };