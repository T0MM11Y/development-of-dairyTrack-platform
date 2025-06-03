import { API_URL3 } from "../../api/apiController.js";
import Swal from "sweetalert2";

export const getSymptoms = async () => {
  try {
    const res = await fetch(`${API_URL3}/symptoms/`);
    return await res.json();
  } catch (err) {
    Swal.fire("Error", "Gagal mengambil data gejala", "error");
  }
};

export const getSymptomById = async (id) => {
  try {
    const res = await fetch(`${API_URL3}/symptoms/${id}/`);
    return await res.json();
  } catch (err) {
    Swal.fire("Error", "Gagal mengambil detail gejala", "error");
  }
};

export const createSymptom = async (data) => {
  try {
    const res = await fetch(`${API_URL3}/symptoms/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (res.ok) {
      Swal.fire("Success", result.message || "Gejala berhasil ditambahkan", "success");
    } else {
      Swal.fire("Error", result.message || "Gagal menambahkan gejala", "error");
    }
    return result;
  } catch (err) {
    Swal.fire("Error", "Terjadi kesalahan saat menambahkan gejala", "error");
  }
};

export const updateSymptom = async (id, data) => {
  try {
    const res = await fetch(`${API_URL3}/symptoms/${id}/`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (res.ok) {
      Swal.fire("Success", result.message || "Gejala berhasil diperbarui", "success");
    } else {
      Swal.fire("Error", result.message || "Gagal memperbarui gejala", "error");
    }
    return result;
  } catch (err) {
    Swal.fire("Error", "Terjadi kesalahan saat memperbarui gejala", "error");
  }
};

export const deleteSymptom = async (id) => {
  try {
    const res = await fetch(`${API_URL3}/symptoms/${id}/`, { method: "DELETE" });
    const result = await res.json();
    if (res.ok) {
      Swal.fire("Success", result.message || "Gejala berhasil dihapus", "success");
    } else {
      Swal.fire("Error", result.message || "Gagal menghapus gejala", "error");
    }
    return result;
  } catch (err) {
    Swal.fire("Error", "Terjadi kesalahan saat menghapus gejala", "error");
  }
};
