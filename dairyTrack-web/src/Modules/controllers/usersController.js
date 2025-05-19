import { API_URL1 } from "../../api/apiController.js";
import Swal from "sweetalert2"; // Import SweetAlert

// Fungsi untuk mendapatkan semua pengguna
export const getAllUsers = async () => {
  try {
    const response = await fetch(`${API_URL1}/user/list`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const data = await response.json();
      return { success: true, users: data.users }; // Kembalikan daftar pengguna
    } else {
      const error = await response.json();
      return { success: false, message: error.message };
    }
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "An error occurred while fetching users.",
    });
    console.error("Error fetching users:", error);
    return {
      success: false,
      message: "An error occurred while fetching users.",
    };
  }
};
export const getUserById = async (userId) => {
  try {
    const response = await fetch(`${API_URL1}/user/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const data = await response.json();
      return { success: true, user: data.user }; // Kembalikan data pengguna
    } else {
      const error = await response.json();
      return { success: false, message: error.error || "User not found." };
    }
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "An error occurred while fetching the user.",
    });
    console.error("Error fetching user:", error);
    return {
      success: false,
      message: "An error occurred while fetching the user.",
    };
  }
};

// Fungsi untuk menghapus pengguna berdasarkan user_id
export const deleteUser = async (userId) => {
  try {
    const response = await fetch(`${API_URL1}/user/delete/${userId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const data = await response.json();
      Swal.fire({
        icon: "success",
        title: "Success",
        text: data.message, // Pesan sukses dari server
      });
      return { success: true, message: data.message };
    } else {
      const error = await response.json();
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.error || "Failed to delete user.", // Pesan error dari server
      });
      return { success: false, message: error.error };
    }
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "An error occurred while deleting the user.",
    });
    console.error("Error deleting user:", error);
    return {
      success: false,
      message: "An error occurred while deleting the user.",
    };
  }
};

export const editUser = async (userId, updatedData) => {
  try {
    const response = await fetch(`${API_URL1}/user/edit/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedData),
    });

    if (response.ok) {
      const data = await response.json();
      Swal.fire({
        icon: "success",
        title: "Success",
        text: data.message, // Pesan sukses dari server
      });
      return { success: true, user: data.user };
    } else {
      const error = await response.json();
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.error || "Failed to update user.", // Pesan error dari server
      });
      return { success: false, message: error.error };
    }
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "An error occurred while updating the user.",
    });
    console.error("Error updating user:", error);
    return {
      success: false,
      message: "An error occurred while updating the user.",
    };
  }
};

// Fungsi untuk mengekspor Data Pengguna ke PDF
export const exportUsersToPDF = async () => {
  try {
    const response = await fetch(`${API_URL1}/user/export/pdf`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "users.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Users exported to PDF successfully.",
      });
    } else {
      const error = await response.json();
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.error || "Failed to export users to PDF.",
      });
    }
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "An error occurred while exporting users to PDF.",
    });
    console.error("Error exporting users to PDF:", error);
  }
};

// Fungsi untuk mengekspor Data Pengguna ke Excel
export const exportUsersToExcel = async () => {
  try {
    const response = await fetch(`${API_URL1}/user/export/excel`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "users.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Users exported to Excel successfully.",
      });
    } else {
      const error = await response.json();
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.error || "Failed to export users to Excel.",
      });
    }
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "An error occurred while exporting users to Excel.",
    });
    console.error("Error exporting users to Excel:", error);
  }
};

// Function to get all farmers
export const getAllFarmers = async () => {
  try {
    const response = await fetch(`${API_URL1}/user/farmers`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const data = await response.json();
      if (data.status === "success") {
        return {
          success: true,
          farmers: data.farmers.map((farmer) => ({
            user_id: farmer.id,
            name: farmer.name,
            username: farmer.username,
            email: farmer.email,
            contact: farmer.contact,
            religion: farmer.religion,
            birth: farmer.birth,
            role: farmer.role_name,
          })),
          totalFarmers: data.total_farmers,
        };
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.message || "Failed to fetch farmers.",
        });
        return {
          success: false,
          message: data.message,
        };
      }
    } else {
      const error = await response.json();
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to fetch farmers.",
      });
      return {
        success: false,
        message: error.message,
      };
    }
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "An error occurred while fetching farmers.",
    });
    console.error("Error fetching farmers:", error);
    return {
      success: false,
      message: "An error occurred while fetching farmers.",
    };
  }
};

// Function to reset user password
export const resetUserPassword = async (userId) => {
  try {
    const response = await fetch(`${API_URL1}/user/reset-password/${userId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const data = await response.json();
      Swal.fire({
        icon: "success",
        title: "Success",
        text: data.message, // Success message from server
      });
      return {
        success: true,
        message: data.message,
        user: { id: data.user_id, role: data.role },
      };
    } else {
      const error = await response.json();
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.error || error.message || "Failed to reset password.",
      });
      return { success: false, message: error.error || error.message };
    }
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "An error occurred while resetting the password.",
    });
    console.error("Error resetting password:", error);
    return {
      success: false,
      message: "An error occurred while resetting the password.",
    };
  }
};

// Function to change user password
export const changeUserPassword = async (userId, oldPassword, newPassword) => {
  try {
    const response = await fetch(`${API_URL1}/user/change-password/${userId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        old_password: oldPassword,
        new_password: newPassword,
      }),
    });

    const data = await response.json();
    if (response.ok && data.status === "success") {
      Swal.fire({
        icon: "success",
        title: "Success",
        text: data.message,
      });
      return { success: true, message: data.message };
    } else {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: data.message || "Failed to change password.",
      });
      return { success: false, message: data.message };
    }
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "An error occurred while changing the password.",
    });
    console.error("Error changing password:", error);
    return {
      success: false,
      message: "An error occurred while changing the password.",
    };
  }
};
// ...existing code...
