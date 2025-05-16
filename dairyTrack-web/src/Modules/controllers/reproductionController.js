import { API_URL3 } from "../../api/apiController.js";
import Swal from "sweetalert2";

export const getReproductions = async () => {
  try {
    const res = await fetch(`${API_URL3}/reproduction/`);
    return await res.json();
  } catch (err) {
    Swal.fire("Error", "Gagal mengambil data reproduksi", "error");
  }
};

export const getReproductionById = async (id) => {
  try {
    const res = await fetch(`${API_URL3}/reproduction/${id}/`);
    return await res.json();
  } catch (err) {
    Swal.fire("Error", "Gagal mengambil detail reproduksi", "error");
  }
};

export const createReproduction = async (data) => {
  try {
    const res = await fetch(`${API_URL3}/reproduction/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (res.ok) {
      Swal.fire("Success", result.message || "Data reproduksi berhasil ditambahkan", "success");
    } else {
      Swal.fire("Error", result.message || "Gagal menambahkan data reproduksi", "error");
    }
    return result;
  } catch (err) {
    Swal.fire("Error", "Terjadi kesalahan saat menambahkan data reproduksi", "error");
  }
};

export const updateReproduction = async (id, data) => {
  try {
    const res = await fetch(`${API_URL3}/reproduction/${id}/`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (res.ok) {
      Swal.fire("Success", result.message || "Data reproduksi berhasil diperbarui", "success");
    } else {
      Swal.fire("Error", result.message || "Gagal memperbarui data reproduksi", "error");
    }
    return result;
  } catch (err) {
    Swal.fire("Error", "Terjadi kesalahan saat memperbarui data reproduksi", "error");
  }
};

export const deleteReproduction = async (id) => {
  try {
    const res = await fetch(`${API_URL3}/reproduction/${id}/`, { method: "DELETE" });

    let result = {};
    if (res.status !== 204) {
      result = await res.json();
    }

    if (res.ok) {
      Swal.fire("Success", result.message || "Data reproduksi berhasil dihapus", "success");
    } else {
      Swal.fire("Error", result.message || "Gagal menghapus data reproduksi", "error");
    }

    return result;
  } catch (err) {
    Swal.fire("Error", "Terjadi kesalahan saat menghapus data reproduksi", "error");
  }
};
