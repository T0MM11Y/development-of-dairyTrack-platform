// feedTypeController.js
import { API_URL4 } from "../../api/apiController.js";
import Swal from "sweetalert2";

export const addFeedType = async (feedTypeData) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = user.token || null;
  console.log("addFeedType - Token:", token); // Debug log
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
    const response = await fetch(`${API_URL4}/feedType`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(feedTypeData),
    });

    if (response.ok) {
      const data = await response.json();
      Swal.fire({
        icon: "success",
        title: "Sukses",
        text: data.message,
      });
      return { success: true, feedType: data.data };
    } else {
      const error = await response.json();
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: error.message || "Gagal menambahkan jenis pakan.",
      });
      return { success: false, message: error.message };
    }
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Gagal",
      text: "Terjadi kesalahan saat menambahkan jenis pakan.",
    });
    console.error("Error adding feed type:", error);
    return {
      success: false,
      message: "Terjadi kesalahan saat menambahkan jenis pakan.",
    };
  }
};

export const getFeedTypeById = async (feedTypeId) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = user.token || null;
  console.log("getFeedTypeById - Token:", token, "ID:", feedTypeId); // Debug log
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
    const response = await fetch(`${API_URL4}/feedType/${feedTypeId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      return { success: true, feedType: data.data };
    } else {
      const error = await response.json();
      return {
        success: false,
        message: error.message || "Jenis pakan tidak ditemukan.",
      };
    }
  } catch (error) {
    console.error("Error fetching feed type by ID:", error);
    return {
      success: false,
      message: "Terjadi kesalahan saat mengambil data jenis pakan.",
    };
  }
};

export const listFeedTypes = async () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = user.token || null;
  console.log("listFeedTypes - Token:", token); // Debug log
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
    const response = await fetch(`${API_URL4}/feedType`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      return { success: true, feedTypes: data.data };
    } else {
      const error = await response.json();
      return {
        success: false,
        message: error.message || "Gagal mengambil daftar jenis pakan.",
      };
    }
  } catch (error) {
    console.error("Error fetching feed types:", error);
    return {
      success: false,
      message: "Terjadi kesalahan saat mengambil daftar jenis pakan.",
    };
  }
};

export const updateFeedType = async (feedTypeId, feedTypeData) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = user.token || null;
  console.log("updateFeedType - Token:", token, "ID:", feedTypeId);
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
    const response = await fetch(`${API_URL4}/feedType/${feedTypeId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(feedTypeData),
    });

    const data = await response.json();
    if (response.status === 200) {
      return { success: true, feedType: data.data, message: data.message };
    } else {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: data.message || "Gagal memperbarui jenis pakan.",
      });
      return { success: false, message: data.message || "Gagal memperbarui jenis pakan." };
    }
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Gagal",
      text: "Terjadi kesalahan saat memperbarui jenis pakan.",
    });
    console.error("Error updating feed type:", error);
    return {
      success: false,
      message: "Terjadi kesalahan saat memperbarui jenis pakan.",
    };
  }
};

export const deleteFeedType = async (feedTypeId) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = user.token || null;
  console.log("deleteFeedType - Token:", token); // Debug log
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
    const response = await fetch(`${API_URL4}/feedType/${feedTypeId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      Swal.fire({
        icon: "success",
        title: "Sukses",
        text: data.message,
      });
      return { success: true };
    } else {
      const error = await response.json();
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: error.message || "Gagal menghapus jenis pakan.",
      });
      return { success: false, message: error.message };
    }
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Gagal",
      text: "Terjadi kesalahan saat menghapus jenis pakan.",
    });
    console.error("Error deleting feed type:", error);
    return {
      success: false,
      message: "Terjadi kesalahan saat menghapus jenis pakan.",
    };
  }
};

export const exportFeedTypesToPDF = async () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = user.token || null;
  console.log("exportFeedTypesToPDF - Token:", token); // Debug log
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
      Swal.fire({
        icon: "success",
        title: "Sukses",
        text: "Jenis pakan berhasil diekspor ke PDF.",
      });
    } else {
      const error = await response.json();
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: error.message || "Gagal mengekspor jenis pakan ke PDF.",
      });
    }
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Gagal",
      text: "Terjadi kesalahan saat mengekspor jenis pakan ke PDF.",
    });
    console.error("Error exporting feed types to PDF:", error);
  }
};

export const exportFeedTypesToExcel = async () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = user.token || null;
  console.log("exportFeedTypesToExcel - Token:", token); // Debug log
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
    const response = await fetch(`${API_URL4}/feedType/export/excel`, {
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
      a.download = "feed_types.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      Swal.fire({
        icon: "success",
        title: "Sukses",
        text: "Jenis pakan berhasil diekspor ke Excel.",
      });
    } else {
      const error = await response.json();
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: error.message || "Gagal mengekspor jenis pakan ke Excel.",
      });
    }
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Gagal",
      text: "Terjadi kesalahan saat mengekspor jenis pakan ke Excel.",
    });
    console.error("Error exporting feed types to Excel:", error);
  }
};
