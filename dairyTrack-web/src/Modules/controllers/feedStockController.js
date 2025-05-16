import { API_URL4 } from "../../api/apiController.js";
import Swal from "sweetalert2";

const getAllFeedStocks = async () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = user.token;

  const response = await fetch(`${API_URL4}/feedStock`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Gagal mengambil data stok pakan");
  }
  return result;
};

const getFeedStockById = async (id) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = user.token;

  const response = await fetch(`${API_URL4}/feedStock/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Gagal mengambil stok pakan");
  }
  return result;
};

const addFeedStock = async (data) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = user.token;

  const response = await fetch(`${API_URL4}/feedStock/add`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Gagal menambah stok pakan");
  }
  return result;
};

const updateFeedStock = async (id, data) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = user.token;

  const response = await fetch(`${API_URL4}/feedStock/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Gagal memperbarui stok pakan");
  }
  return result;
};

export { getAllFeedStocks, getFeedStockById, addFeedStock, updateFeedStock };