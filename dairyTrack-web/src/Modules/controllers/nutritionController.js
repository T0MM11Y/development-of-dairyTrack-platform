// nutritionController.js
import { API_URL4 } from "../../api/apiController.js";
import Swal from "sweetalert2";

export const addNutrition = async (nutritionData) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = user.token || null;
  console.log("addNutrition - Token:", token, "Data:", nutritionData);
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
    const response = await fetch(`${API_URL4}/nutrition`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(nutritionData),
    });

    const data = await response.json();
    console.log("addNutrition - Response:", { status: response.status, data });
    if (response.ok) {
      return { success: true, nutrition: data.data || data.nutrition || {}, message: data.message || "Nutrisi berhasil ditambahkan." };
    } else {
      return { success: false, message: data.message || "Gagal menambahkan nutrisi." };
    }
  } catch (error) {
    console.error("addNutrition - Error:", error.message || error);
    return {
      success: false,
      message: "Terjadi kesalahan saat menambahkan nutrisi.",
    };
  }
};

export const getNutritionById = async (nutritionId) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = user.token || null;
  console.log("getNutritionById - Token:", token, "ID:", nutritionId);
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
    const response = await fetch(`${API_URL4}/nutrition/${nutritionId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (response.status === 200) {
      return { success: true, nutrition: data.data };
    } else {
      return { success: false, message: data.message || "Nutrisi tidak ditemukan." };
    }
  } catch (error) {
    console.error("Error fetching nutrition by ID:", error);
    return {
      success: false,
      message: "Terjadi kesalahan saat mengambil data nutrisi.",
    };
  }
};

export const listNutritions = async () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = user.token || null;
  console.log("listNutritions - Token:", token);
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
    const response = await fetch(`${API_URL4}/nutrition`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (response.status === 200) {
      return { success: true, nutritions: data.data };
    } else {
      return {
        success: false,
        message: data.message || "Gagal mengambil daftar nutrisi.",
      };
    }
  } catch (error) {
    console.error("Error fetching nutritions:", error);
    return {
      success: false,
      message: "Terjadi kesalahan saat mengambil daftar nutrisi.",
    };
  }
};

export const updateNutrition = async (nutritionId, nutritionData) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = user.token || null;
  console.log("updateNutrition - Token:", token, "ID:", nutritionId);
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
    const response = await fetch(`${API_URL4}/nutrition/${nutritionId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(nutritionData),
    });

    const data = await response.json();
    if (response.status === 200) {
      Swal.fire({
        icon: "success",
        title: "Sukses",
        text: data.message || "Nutrisi berhasil diperbarui.",
      });
      return { success: true, nutrition: data.data };
    } else {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: data.message || "Gagal memperbarui nutrisi.",
      });
      return { success: false, message: data.message };
    }
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Gagal",
      text: "Terjadi kesalahan saat memperbarui nutrisi.",
    });
    console.error("Error updating nutrition:", error);
    return {
      success: false,
      message: "Terjadi kesalahan saat memperbarui nutrisi.",
    };
  }
};

export const deleteNutrition = async (nutritionId) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = user.token || null;
  console.log("deleteNutrition - Token:", token, "ID:", nutritionId);
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
    const response = await fetch(`${API_URL4}/nutrition/${nutritionId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (response.status === 200) {
      Swal.fire({
        icon: "success",
        title: "Sukses",
        text: data.message || "Nutrisi berhasil dihapus.",
      });
      return { success: true };
    } else {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: data.message || "Gagal menghapus nutrisi.",
      });
      return { success: false, message: data.message };
    }
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Gagal",
      text: "Terjadi kesalahan saat menghapus nutrisi.",
    });
    console.error("Error deleting nutrition:", error);
    return {
      success: false,
      message: "Terjadi kesalahan saat menghapus nutrisi.",
    };
  }
};

export const exportNutritionsToPDF = async () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = user.token || null;
  console.log("exportNutritionsToPDF - Token:", token);
  if (!token) {
    Swal.fire({
      icon: "error",
      title: "Sesi Berakhir",
      text: "Token tidak ditemukan. Silakan login kembali.",
    });
    localStorage.removeItem("user");
    window.location.href = "/";
    return;
  }
  try {
    const response = await fetch(`${API_URL4}/nutrition/export/pdf`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 200) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "nutritions.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      Swal.fire({
        icon: "success",
        title: "Sukses",
        text: "Nutrisi berhasil diekspor ke PDF.",
      });
    } else {
      const error = await response.json();
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: error.message || "Gagal mengekspor nutrisi ke PDF.",
      });
    }
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Gagal",
      text: "Terjadi kesalahan saat mengekspor nutrisi ke PDF.",
    });
    console.error("Error exporting nutritions to PDF:", error);
  }
};

export const exportNutritionsToExcel = async () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = user.token || null;
  console.log("exportNutritionsToExcel - Token:", token);
  if (!token) {
    Swal.fire({
      icon: "error",
      title: "Sesi Berakhir",
      text: "Token tidak ditemukan. Silakan login kembali.",
    });
    localStorage.removeItem("user");
    window.location.href = "/";
    return;
  }
  try {
    const response = await fetch(`${API_URL4}/nutrition/export/excel`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 200) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "nutritions.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      Swal.fire({
        icon: "success",
        title: "Sukses",
        text: "Nutrisi berhasil diekspor ke Excel.",
      });
    } else {
      const error = await response.json();
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: error.message || "Gagal mengekspor nutrisi ke Excel.",
      });
    }
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Gagal",
      text: "Terjadi kesalahan saat mengekspor nutrisi ke Excel.",
    });
    console.error("Error exporting nutritions to Excel:", error);
  }
};