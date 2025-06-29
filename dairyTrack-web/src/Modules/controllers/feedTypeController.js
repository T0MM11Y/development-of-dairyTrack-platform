import { API_URL4 } from "../../api/apiController.js";

export const addFeedType = async (feedTypeData) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = user.token || null;
  console.log("addFeedType - Token:", token, "Data:", feedTypeData);

  try {
    const response = await fetch(`${API_URL4}/feedType`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(feedTypeData),
    });

    const data = await response.json();
    console.log("addFeedType - Response:", data); // Debugging
    return response.ok
      ? { success: true, feedType: data.data, message: data.message || "Jenis pakan berhasil ditambahkan." }
      : { success: false, message: data.message || "Gagal menambahkan jenis pakan." };
  } catch (error) {
    console.error("addFeedType - Error:", error.message);
    return { success: false, message: `Terjadi kesalahan saat menambahkan jenis pakan: ${error.message}` };
  }
};

export const getFeedTypeById = async (feedTypeId) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = user.token || null;
  console.log("getFeedTypeById - Token:", token, "ID:", feedTypeId);

  try {
    const response = await fetch(`${API_URL4}/feedType/${feedTypeId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    console.log("getFeedTypeById - Response:", data); // Debugging
    return response.ok
      ? { success: true, feedType: data.data }
      : { success: false, message: data.message || "Jenis pakan tidak ditemukan." };
  } catch (error) {
    console.error("getFeedTypeById - Error:", error.message);
    return { success: false, message: `Terjadi kesalahan saat mengambil data jenis pakan: ${error.message}` };
  }
};

export const listFeedTypes = async () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = user.token || null;
  console.log("listFeedTypes - Token:", token);

  try {
    const response = await fetch(`${API_URL4}/feedType`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    console.log("listFeedTypes - Response:", data); // Debugging
    return response.ok
      ? { success: true, feedTypes: data.data || [] }
      : { success: false, message: data.message || "Gagal mengambil daftar jenis pakan." };
  } catch (error) {
    console.error("listFeedTypes - Error:", error.message);
    return { success: false, message: `Terjadi kesalahan saat mengambil daftar jenis pakan: ${error.message}` };
  }
};

export const updateFeedType = async (feedTypeId, feedTypeData) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = user.token || null;
  console.log("updateFeedType - Token:", token, "ID:", feedTypeId, "Data:", feedTypeData);

  try {
    const response = await fetch(`${API_URL4}/feedType/${feedTypeId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(feedTypeData),
    });

    const data = await response.json();
    console.log("updateFeedType - Response:", data); // Debugging
    return response.ok
      ? { success: true, feedType: data.data, message: data.message || "Jenis pakan berhasil diperbarui." }
      : { success: false, message: data.message || "Gagal memperbarui jenis pakan." };
  } catch (error) {
    console.error("updateFeedType - Error:", error.message);
    return { success: false, message: `Terjadi kesalahan saat memperbarui jenis pakan: ${error.message}` };
  }
};

export const deleteFeedType = async (feedTypeId) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = user.token || null;
  console.log("deleteFeedType - Token:", token, "ID:", feedTypeId);

  try {
    const response = await fetch(`${API_URL4}/feedType/${feedTypeId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    console.log("deleteFeedType - Response:", data); // Debugging
    return response.ok
      ? { success: true, message: data.message || "Jenis pakan berhasil dihapus." }
      : { success: false, message: data.message || "Gagal menghapus jenis pakan." };
  } catch (error) {
    console.error("deleteFeedType - Error:", error.message);
    return { success: false, message: `Terjadi kesalahan saat menghapus jenis pakan: ${error.message}` };
  }
};

