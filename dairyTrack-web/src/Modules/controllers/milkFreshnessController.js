import { API_URL1 } from "../../api/apiController.js";
import Swal from "sweetalert2";

/**
 * Get analysis of all fresh milk batches with their freshness status
 */
export const getMilkFreshnessAnalysis = async () => {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const token = user.token || null;

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

    const response = await fetch(`${API_URL1}/milk-freshness/analysis`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (response.ok) {
      return { success: true, data: data.data };
    } else {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: data.error || "Gagal mengambil analisis kesegaran susu.",
      });
      return { success: false, message: data.error };
    }
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Terjadi kesalahan saat mengambil data kesegaran susu.",
    });
    console.error("Error getting milk freshness analysis:", error);
    return {
      success: false,
      message: "Terjadi kesalahan saat mengambil data kesegaran susu.",
    };
  }
};

/**
 * Get statistics about milk batch freshness status
 */
export const getMilkFreshnessStats = async () => {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const token = user.token || null;

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

    const response = await fetch(`${API_URL1}/milk-freshness/stats`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (response.ok) {
      return { success: true, stats: data.stats };
    } else {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: data.error || "Gagal mengambil statistik kesegaran susu.",
      });
      return { success: false, message: data.error };
    }
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Terjadi kesalahan saat mengambil statistik kesegaran susu.",
    });
    console.error("Error getting milk freshness stats:", error);
    return {
      success: false,
      message: "Terjadi kesalahan saat mengambil statistik kesegaran susu.",
    };
  }
};

/**
 * Get milk batches that are close to expiration
 * @param {number} hours - Time window in hours (default: 24)
 */
export const getCriticalMilkBatches = async (hours = 24) => {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const token = user.token || null;

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

    const response = await fetch(
      `${API_URL1}/milk-freshness/critical?hours=${hours}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();
    if (response.ok) {
      return {
        success: true,
        data: data.data,
        count: data.count,
        message: data.message,
      };
    } else {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: data.error || "Gagal mengambil data batch susu kritis.",
      });
      return { success: false, message: data.error };
    }
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Terjadi kesalahan saat mengambil data batch susu kritis.",
    });
    console.error("Error getting critical milk batches:", error);
    return {
      success: false,
      message: "Terjadi kesalahan saat mengambil data batch susu kritis.",
    };
  }
};

/**
 * Manually trigger milk expiry check and notification process
 */
export const runMilkFreshnessCheck = async () => {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const token = user.token || null;

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

    const response = await fetch(
      `${API_URL1}/milk-freshness/check-and-notify`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();
    if (response.ok) {
      Swal.fire({
        icon: "success",
        title: "Sukses",
        text: `Pemeriksaan kesegaran susu berhasil. ${data.notifications_created} notifikasi dibuat.`,
      });
      return {
        success: true,
        message: data.message,
        notificationsCreated: data.notifications_created,
      };
    } else {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: data.error || "Gagal menjalankan pemeriksaan kesegaran susu.",
      });
      return { success: false, message: data.error };
    }
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Terjadi kesalahan saat menjalankan pemeriksaan kesegaran susu.",
    });
    console.error("Error running freshness check:", error);
    return {
      success: false,
      message: "Terjadi kesalahan saat menjalankan pemeriksaan kesegaran susu.",
    };
  }
};

/**
 * Export milk freshness analysis as PDF report
 */
export const exportMilkFreshnessToPDF = async () => {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const token = user.token || null;

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

    const response = await fetch(`${API_URL1}/milk-freshness/export/pdf`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "milk_freshness_report.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();

      Swal.fire({
        icon: "success",
        title: "Sukses",
        text: "Laporan kesegaran susu berhasil diekspor ke PDF.",
      });
      return { success: true };
    } else {
      const error = await response.json();
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: error.error || "Gagal mengekspor laporan kesegaran susu ke PDF.",
      });
      return { success: false, message: error.error };
    }
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Gagal",
      text: "Terjadi kesalahan saat mengekspor laporan kesegaran susu ke PDF.",
    });
    console.error("Error exporting milk freshness to PDF:", error);
    return { success: false, message: "Export failed" };
  }
};
