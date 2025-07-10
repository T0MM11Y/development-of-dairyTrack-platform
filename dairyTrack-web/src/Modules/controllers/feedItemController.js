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
    console.error("getAllFeedItems - Error:", error.message);
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
    console.error("getFeedItemsByDailyFeedId - Error:", error.message);
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
    console.error("getFeedItemById - Error:", error.message);
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
    console.error("addFeedItem - Error:", error.message);
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
    console.error("updateFeedItem - Error:", error.message);
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
    console.error("deleteFeedItem - Error:", error.message);
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
    console.error("bulkUpdateFeedItems - Error:", error.message);
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
    console.error("getFeedUsageByDate - Error:", error.message);
    return { success: false, message: "Terjadi kesalahan saat mengambil data penggunaan pakan" };
  }
};

const exportFeedItemsToPDF = async (startDate, endDate) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = user.token || null;

  try {
    const response = await fetch(`${API_URL4}/dailyFeedItem/export/pdf?start_date=${startDate}&end_date=${endDate}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.message || "Gagal mengekspor data ke PDF");
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `feed_items_${startDate}_to_${endDate}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
    return { success: true, message: "Data berhasil diekspor ke PDF" };
  } catch (error) {
    console.error("exportFeedItemsToPDF - Error:", error.message);
    return { success: false, message: "Terjadi kesalahan saat mengekspor data ke PDF" };
  }
};

const exportFeedItemsToExcel = async (startDate, endDate) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = user.token || null;

  try {
    const response = await fetch(`${API_URL4}/dailyFeedItem/export/excel?start_date=${startDate}&end_date=${endDate}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.message || "Gagal mengekspor data ke Excel");
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `feed_items_${startDate}_to_${endDate}.xlsx`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
    return { success: true, message: "Data berhasil diekspor ke Excel" };
  } catch (error) {
    console.error("exportFeedItemsToExcel - Error:", error.message);
    return { success: false, message: "Terjadi kesalahan saat mengekspor data ke Excel" };
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
  exportFeedItemsToPDF,
  exportFeedItemsToExcel,
};