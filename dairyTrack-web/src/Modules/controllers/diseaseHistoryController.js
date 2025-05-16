import { API_URL3 } from "../../api/apiController.js";
import Swal from "sweetalert2";

export const getDiseaseHistories = async () => {
  try {
    const res = await fetch(`${API_URL3}/disease-history/`);
    return await res.json();
  } catch (err) {
    Swal.fire("Error", "Gagal mengambil data penyakit", "error");
  }
};

export const getDiseaseHistoryById = async (id) => {
  try {
    const res = await fetch(`${API_URL3}/disease-history/${id}/`);
    return await res.json();
  } catch (err) {
    Swal.fire("Error", "Gagal mengambil detail penyakit", "error");
  }
};

export const createDiseaseHistory = async (data) => {
  try {
    const res = await fetch(`${API_URL3}/disease-history/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (res.ok) {
      Swal.fire("Success", result.message || "Riwayat penyakit berhasil ditambahkan", "success");
    } else {
      Swal.fire("Error", result.message || "Gagal menambahkan riwayat penyakit", "error");
    }
    return result;
  } catch (err) {
    Swal.fire("Error", "Terjadi kesalahan saat menambahkan riwayat penyakit", "error");
  }
};

export const updateDiseaseHistory = async (id, data) => {
  try {
    const res = await fetch(`${API_URL3}/disease-history/${id}/`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (res.ok) {
      Swal.fire("Success", result.message || "Riwayat penyakit berhasil diperbarui", "success");
    } else {
      Swal.fire("Error", result.message || "Gagal memperbarui riwayat penyakit", "error");
    }
    return result;
  } catch (err) {
    Swal.fire("Error", "Terjadi kesalahan saat memperbarui riwayat penyakit", "error");
  }
};

export const deleteDiseaseHistory = async (id) => {
  try {
    const res = await fetch(`${API_URL3}/disease-history/${id}/`, {
      method: "DELETE",
    });

    // ✅ Cek jika tidak ada konten (204), jangan panggil res.json()
    let result = null;
    if (res.status !== 204) {
      result = await res.json();
    }

    if (res.ok) {
      Swal.fire(
        "Berhasil",
        result?.message || "Riwayat penyakit berhasil dihapus.",
        "success"
      );
    } else {
      Swal.fire(
        "Gagal",
        result?.message || "Gagal menghapus riwayat penyakit.",
        "error"
      );
    }

    return result;
  } catch (err) {
    Swal.fire(
      "Kesalahan",
      "Terjadi kesalahan saat menghapus riwayat penyakit.",
      "error"
    );
  }
};

