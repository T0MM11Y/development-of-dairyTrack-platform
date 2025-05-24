import { API_URL4 } from "../../api/apiController.js";

export const addFeedType = async (feedTypeData) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = user.token || null;
  console.log("addFeedType - Token:", token);

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
    return response.ok
      ? { success: true, feedType: data.data }
      : { success: false, message: data.message || "Gagal menambahkan jenis pakan." };
  } catch (error) {
    console.error("addFeedType - Error:", error);
    return { success: false, message: "Terjadi kesalahan saat menambahkan jenis pakan." };
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
    return response.ok
      ? { success: true, feedType: data.data }
      : { success: false, message: data.message || "Jenis pakan tidak ditemukan." };
  } catch (error) {
    console.error("getFeedTypeById - Error:", error);
    return { success: false, message: "Terjadi kesalahan saat mengambil data jenis pakan." };
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
    return response.ok
      ? { success: true, feedTypes: data.data }
      : { success: false, message: data.message || "Gagal mengambil daftar jenis pakan." };
  } catch (error) {
    console.error("listFeedTypes - Error:", error);
    return { success: false, message: "Terjadi kesalahan saat mengambil daftar jenis pakan." };
  }
};

export const updateFeedType = async (feedTypeId, feedTypeData) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = user.token || null;
  console.log("updateFeedType - Token:", token, "ID:", feedTypeId);

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
    return response.ok
      ? { success: true, feedType: data.data, message: data.message }
      : { success: false, message: data.message || "Gagal memperbarui jenis pakan." };
  } catch (error) {
    console.error("updateFeedType - Error:", error);
    return { success: false, message: "Terjadi kesalahan saat memperbarui jenis pakan." };
  }
};

export const deleteFeedType = async (feedTypeId) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = user.token || null;
  console.log("deleteFeedType - Token:", token);

  try {
    const response = await fetch(`${API_URL4}/feedType/${feedTypeId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    return response.ok
      ? { success: true }
      : { success: false, message: data.message || "Gagal menghapus jenis pakan." };
  } catch (error) {
    console.error("deleteFeedType - Error:", error);
    return { success: false, message: "Terjadi kesalahan saat menghapus jenis pakan." };
  }
};

export const exportFeedTypesToPDF = async () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = user.token || null;
  console.log("exportFeedTypesToPDF - Token:", token);

  try {
    const response = await fetch(`${API_URL4}/feedType/export/pdf`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "feed_types.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      return { success: true, message: "Jenis pakan berhasil diekspor ke PDF." };
    } else {
      const error = await response.json();
      return { success: false, message: error.message || "Gagal mengekspor jenis pakan ke PDF." };
    }
  } catch (error) {
    console.error("exportFeedTypesToPDF - Error:", error);
    return { success: false, message: "Terjadi kesalahan saat mengekspor jenis pakan ke PDF." };
  }
};

export const exportFeedTypesToExcel = async () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = user.token || null;
  console.log("exportFeedTypesToExcel - Token:", token);

  try {
    const response = await fetch(`${API_URL4}/feedType/export/excel`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      },
    );

    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "feed_types.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      return { success: true, message: "Jenis pakan berhasil diekspor ke Excel." };
    } else {
      const error = await response.json();
      return { success: false, message: error.message || "Gagal mengekspor jenis pakan ke Excel." };
    }
  } catch (error) {
    console.error("exportFeedTypesToExcel - Error:", error);
    return { success: false, message: "Terjadi kesalahan saat mengekspor jenis pakan ke Excel." };
  }
};