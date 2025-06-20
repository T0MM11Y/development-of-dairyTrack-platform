import { API_URL1 } from "../../api/apiController.js";
import Swal from "sweetalert2";

// Fungsi untuk menghapus notifikasi berdasarkan ID
export const deleteNotification = async (notificationId, userId) => {
  try {
    const response = await fetch(`${API_URL1}/notification/${notificationId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ user_id: userId }),
    });

    if (response.ok) {
      const data = await response.json();
      Swal.fire({
        icon: "success",
        title: "Success",
        text: data.message || "Notifikasi berhasil dihapus.",
      });
      return { success: true, message: data.message };
    } else {
      const error = await response.json();
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.error || "Gagal menghapus notifikasi.",
      });
      return { success: false, message: error.error };
    }
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Terjadi kesalahan saat menghapus notifikasi.",
    });
    console.error("Error deleting notification:", error);
    return {
      success: false,
      message: "Terjadi kesalahan saat menghapus notifikasi.",
    };
  }
};

// Fungsi untuk menghapus semua notifikasi user
export const clearAllNotifications = async (userId) => {
  try {
    const response = await fetch(`${API_URL1}/notification/clear-all`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ user_id: userId }),
    });

    if (response.ok) {
      const data = await response.json();
      Swal.fire({
        icon: "success",
        title: "Success",
        text: data.message || "Semua notifikasi berhasil dihapus.",
      });
      return { success: true, message: data.message };
    } else {
      const error = await response.json();
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.error || "Gagal menghapus semua notifikasi.",
      });
      return { success: false, message: error.error };
    }
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Terjadi kesalahan saat menghapus semua notifikasi.",
    });
    console.error("Error clearing all notifications:", error);
    return {
      success: false,
      message: "Terjadi kesalahan saat menghapus semua notifikasi.",
    };
  }
};

//
