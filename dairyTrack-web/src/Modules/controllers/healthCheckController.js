import { API_URL3 } from "../../api/apiController.js";
import Swal from "sweetalert2";

export const getHealthChecks = async () => {
  try {
    const res = await fetch(`${API_URL3}/health-checks/`);
    return await res.json();
  } catch (err) {
    Swal.fire("Error", "Gagal mengambil data pemeriksaan", "error");
  }
};

export const getHealthCheckById = async (id) => {
  try {
    const res = await fetch(`${API_URL3}/health-checks/${id}/`);
    return await res.json();
  } catch (err) {
    Swal.fire("Error", "Gagal mengambil detail pemeriksaan", "error");
  }
};

export const createHealthCheck = async (data) => {
  try {
    const res = await fetch(`${API_URL3}/health-checks/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (res.ok) {
      Swal.fire("Success", result.message || "Data berhasil ditambahkan", "success");
    } else {
      Swal.fire("Error", result.message || "Gagal menambahkan data", "error");
    }
    return result;
  } catch (err) {
    Swal.fire("Error", "Terjadi kesalahan saat menambahkan data", "error");
  }
};

export const updateHealthCheck = async (id, data) => {
  try {
    const res = await fetch(`${API_URL3}/health-checks/${id}/`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (res.ok) {
      Swal.fire("Success", result.message || "Data berhasil diperbarui", "success");
    } else {
      Swal.fire("Error", result.message || "Gagal memperbarui data", "error");
    }
    return result;
  } catch (err) {
    Swal.fire("Error", "Terjadi kesalahan saat memperbarui data", "error");
  }
};

export const deleteHealthCheck = async (id) => {
  try {
    const res = await fetch(`${API_URL3}/health-checks/${id}/`, { method: "DELETE" });

    if (res.status === 204) {
      Swal.fire("Success", "Data berhasil dihapus", "success");
      return { success: true };
    }

    const result = await res.json();

    if (res.ok) {
      Swal.fire("Success", result.message || "Data berhasil dihapus", "success");
    } else {
      Swal.fire("Error", result.message || "Gagal menghapus data", "error");
    }

    return result;
  } catch (err) {
    Swal.fire("Error", "Terjadi kesalahan saat menghapus data", "error");
    return { success: false };
  }
};

