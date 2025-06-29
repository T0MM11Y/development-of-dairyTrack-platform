import { API_URL4 } from "../../api/apiController.js";
import Swal from "sweetalert2";

export const addFeed = async (feedData) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = user.token || null;
  if (!token) {
    Swal.fire({
      icon: "error",
      title: "Sesi Berakhir",
      text: "Token tidak ditemukan. Silakan login kembali.",
    });
    localStorage.removeItem("user");
    window.location.href = "/";
    return { success: false, message: "Token tidak ditemukan." };
  }
  try {
    const response = await fetch(`${API_URL4}/feed`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(feedData),
    });

    const data = await response.json();
    if (response.ok) {
      return { success: true, feed: data.data, message: data.message };
    } else {
      return { success: false, message: data.message || "Gagal menambahkan pakan." };
    }
  } catch (error) {
    console.error("addFeed - Error:", error.message);
    return { success: false, message: "Terjadi kesalahan saat menambahkan pakan." };
  }
};

export const listFeeds = async () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = user.token || null;
  if (!token) {
    return { success: false, message: "Token tidak ditemukan." };
  }
  try {
    const response = await fetch(`${API_URL4}/feed`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (response.ok) {
      return { success: true, feeds: data.data };
    } else {
      return { success: false, message: data.message || "Gagal memuat data pakan." };
    }
  } catch (error) {
    console.error("listFeeds - Error:", error.message);
    return { success: false, message: "Terjadi kesalahan saat memuat data pakan." };
  }
};

export const getFeedById = async (id) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = user.token || null;
  if (!token) {
    return { success: false, message: "Token tidak ditemukan." };
  }
  try {
    const response = await fetch(`${API_URL4}/feed/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (response.ok) {
      return { success: true, feed: data.data };
    } else {
      return { success: false, message: data.message || "Gagal memuat data pakan." };
    }
  } catch (error) {
    console.error("getFeedById - Error:", error.message);
    return { success: false, message: "Terjadi kesalahan saat memuat data pakan." };
  }
};

export const updateFeed = async (id, feedData) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = user.token || null;
  if (!token) {
    Swal.fire({
      icon: "error",
      title: "Sesi Berakhir",
      text: "Token tidak ditemukan. Silakan login kembali.",
    });
    localStorage.removeItem("user");
    window.location.href = "/";
    return { success: false, message: "Token tidak ditemukan." };
  }
  try {
    const response = await fetch(`${API_URL4}/feed/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(feedData),
    });

    const data = await response.json();
    if (response.ok) {
      return { success: true, feed: data.data, message: data.message };
    } else {
      return { success: false, message: data.message || "Gagal memperbarui pakan." };
    }
  } catch (error) {
    console.error("updateFeed - Error:", error.message);
    return { success: false, message: "Terjadi kesalahan saat memperbarui pakan." };
  }
};

export const deleteFeed = async (id) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = user.token || null;
  if (!token) {
    Swal.fire({
      icon: "error",
      title: "Sesi Berakhir",
      text: "Token tidak ditemukan. Silakan login kembali.",
    });
    localStorage.removeItem("user");
    window.location.href = "/";
    return { success: false, message: "Token tidak ditemukan." };
  }
  try {
    const response = await fetch(`${API_URL4}/feed/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (response.ok) {
      return { success: true, message: data.message };
    } else {
      return { success: false, message: data.message || "Gagal menghapus pakan." };
    }
  } catch (error) {
    console.error("deleteFeed - Error:", error.message);
    return { success: false, message: "Terjadi kesalahan saat menghapus pakan." };
  }
};