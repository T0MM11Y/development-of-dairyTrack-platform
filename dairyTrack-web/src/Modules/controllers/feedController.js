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

  const cleanedFeedData = {
    typeId: feedData.typeId ? parseInt(feedData.typeId) : undefined,
    name: feedData.name ? feedData.name.trim() : undefined,
    unit: feedData.unit ? feedData.unit.trim() : undefined,
    min_stock: feedData.min_stock !== undefined ? parseFloat(feedData.min_stock) : undefined,
    price: feedData.price !== undefined ? parseFloat(feedData.price) : undefined,
    nutrisiList: feedData.nutrisiList
      ? feedData.nutrisiList
          .filter((n) => n.nutrisi_id)
          .map((n) => ({
            nutrisi_id: parseInt(n.nutrisi_id),
            amount: n.amount !== undefined && !isNaN(n.amount) ? parseFloat(n.amount) : 0.0,
          }))
      : [],
  };

  console.log("addFeed - Data yang dikirim:", JSON.stringify(cleanedFeedData, null, 2));

  try {
    if (!cleanedFeedData.name || !cleanedFeedData.unit || cleanedFeedData.min_stock === undefined || cleanedFeedData.price === undefined) {
      return {
        success: false,
        message: "Harap lengkapi semua field wajib: nama, unit, stok minimum, dan harga.",
      };
    }

    const response = await fetch(`${API_URL4}/feed`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(cleanedFeedData),
    });

    const data = await response.json();
    console.log("addFeed - Respons dari backend:", JSON.stringify(data, null, 2));

    if (response.ok) {
      return { success: true, feed: data.data, message: data.message };
    } else {
      return {
        success: false,
        message: data.message || "Gagal menambahkan pakan.",
      };
    }
  } catch (error) {
    console.error("addFeed - Error:", error.message);
    return {
      success: false,
      message: "Terjadi kesalahan saat menambahkan pakan.",
    };
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
    console.log("listFeeds - Respons dari backend:", JSON.stringify(data, null, 2));

    if (response.ok) {
      return { success: true, feeds: data.data };
    } else {
      return {
        success: false,
        message: data.message || "Gagal memuat data pakan.",
      };
    }
  } catch (error) {
    console.error("listFeeds - Error:", error.message);
    return {
      success: false,
      message: "Terjadi kesalahan saat memuat data pakan.",
    };
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
    console.log("getFeedById - Respons dari backend:", JSON.stringify(data, null, 2));

    if (response.ok) {
      return { success: true, feed: data.data };
    } else {
      return {
        success: false,
        message: data.message || "Gagal memuat data pakan.",
      };
    }
  } catch (error) {
    console.error("getFeedById - Error:", error.message);
    return {
      success: false,
      message: "Terjadi kesalahan saat memuat data pakan.",
    };
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

  const cleanedFeedData = {
    typeId: feedData.typeId ? parseInt(feedData.typeId) : undefined,
    name: feedData.name ? feedData.name.trim() : undefined,
    unit: feedData.unit ? feedData.unit.trim() : undefined,
    min_stock: feedData.min_stock !== undefined ? parseFloat(feedData.min_stock) : undefined,
    price: feedData.price !== undefined ? parseFloat(feedData.price) : undefined,
    nutrisiList: feedData.nutrisiList
      ? feedData.nutrisiList
          .filter((n) => n.nutrisi_id)
          .map((n) => ({
            nutrisi_id: parseInt(n.nutrisi_id),
            amount: n.amount !== undefined && !isNaN(n.amount) ? parseFloat(n.amount) : 0.0,
          }))
      : [],
  };

  console.log("updateFeed - Data yang dikirim:", JSON.stringify(cleanedFeedData, null, 2));

  try {
    if (!cleanedFeedData.name || !cleanedFeedData.unit || cleanedFeedData.min_stock === undefined || cleanedFeedData.price === undefined) {
      return {
        success: false,
        message: "Harap lengkapi semua field wajib: nama, unit, stok minimum, dan harga.",
      };
    }

    const response = await fetch(`${API_URL4}/feed/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(cleanedFeedData),
    });

    const data = await response.json();
    console.log("updateFeed - Respons dari backend:", JSON.stringify(data, null, 2));

    if (response.ok) {
      return { success: true, feed: data.data, message: data.message };
    } else {
      return {
        success: false,
        message: data.message || "Gagal memperbarui pakan.",
      };
    }
  } catch (error) {
    console.error("updateFeed - Error:", error.message);
    return {
      success: false,
      message: "Terjadi kesalahan saat memperbarui pakan.",
    };
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
    console.log("deleteFeed - Respons dari backend:", JSON.stringify(data, null, 2));

    if (response.ok) {
      return { success: true, message: data.message };
    } else {
      return {
        success: false,
        message: data.message || "Gagal menghapus pakan.",
      };
    }
  } catch (error) {
    console.error("deleteFeed - Error:", error.message);
    return {
      success: false,
      message: "Terjadi kesalahan saat menghapus pakan.",
    };
  }
};