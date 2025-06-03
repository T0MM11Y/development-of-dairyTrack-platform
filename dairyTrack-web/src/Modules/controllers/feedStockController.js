import { API_URL4 } from "../../api/apiController.js";

const getAllFeedStocks = async () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = user.token || null;

  try {
    const response = await fetch(`${API_URL4}/feedStock`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await response.json();
    return response.ok
      ? result
      : { success: false, message: result.message || "Gagal mengambil data stok pakan" };
  } catch (error) {
    console.error("getAllFeedStocks - Error:", error);
    return { success: false, message: "Terjadi kesalahan saat mengambil data stok pakan" };
  }
};

const getFeedStockById = async (id) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = user.token || null;

  try {
    const response = await fetch(`${API_URL4}/feedStock/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await response.json();
    return response.ok
      ? result
      : { success: false, message: result.message || "Gagal mengambil stok pakan" };
  } catch (error) {
    console.error("getFeedStockById - Error:", error);
    return { success: false, message: "Terjadi kesalahan saat mengambil stok pakan" };
  }
};

const addFeedStock = async (data) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = user.token || null;

  try {
    const response = await fetch(`${API_URL4}/feedStock/add`, {
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
      : { success: false, message: result.message || "Gagal menambah stok pakan" };
  } catch (error) {
    console.error("addFeedStock - Error:", error);
    return { success: false, message: "Terjadi kesalahan saat menambah stok pakan" };
  }
};

const updateFeedStock = async (id, data) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = user.token || null;

  try {
    const response = await fetch(`${API_URL4}/feedStock/${id}`, {
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
      : { success: false, message: result.message || "Gagal memperbarui stok pakan" };
  } catch (error) {
    console.error("updateFeedStock - Error:", error);
    return { success: false, message: "Terjadi kesalahan saat memperbarui stok pakan" };
  }
};

const getAllFeedStockHistory = async () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = user.token || null;

  try {
    const response = await fetch(`${API_URL4}/feedStock/history`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await response.json();
    return response.ok
      ? result
      : { success: false, message: result.message || "Gagal mengambil riwayat stok pakan" };
  } catch (error) {
    console.error("getAllFeedStockHistory - Error:", error);
    return { success: false, message: "Terjadi kesalahan saat mengambil riwayat stok pakan" };
  }
};

const deleteFeedStockHistory = async (id) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = user.token || null;

  try {
    const response = await fetch(`${API_URL4}/feedStock/history/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await response.json();
    return response.ok
      ? result
      : { success: false, message: result.message || "Gagal menghapus riwayat stok pakan" };
  } catch (error) {
    console.error("deleteFeedStockHistory - Error:", error);
    return { success: false, message: "Terjadi kesalahan saat menghapus riwayat stok pakan" };
  }
};

export { getAllFeedStocks, getFeedStockById, addFeedStock, updateFeedStock, getAllFeedStockHistory, deleteFeedStockHistory };