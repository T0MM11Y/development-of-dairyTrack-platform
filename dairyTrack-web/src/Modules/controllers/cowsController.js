import { API_URL1 } from "../../api/apiController.js";
import Swal from "sweetalert2";

// Fungsi untuk menambahkan sapi baru
export const addCow = async (cowData) => {
  try {
    const response = await fetch(`${API_URL1}/cow/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(cowData),
    });

    if (response.ok) {
      const data = await response.json();
      Swal.fire({
        icon: "success",
        title: "Success",
        text: data.message,
      });
      return { success: true, cow: data.cow };
    } else {
      const error = await response.json();
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.error || "Failed to add cow.",
      });
      return { success: false, message: error.error };
    }
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "An error occurred while adding the cow.",
    });
    console.error("Error adding cow:", error);
    return {
      success: false,
      message: "An error occurred while adding the cow.",
    };
  }
};

// Fungsi untuk mendapatkan data sapi berdasarkan ID
export const getCowById = async (cowId) => {
  try {
    const response = await fetch(`${API_URL1}/cow/${cowId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const data = await response.json();
      return { success: true, cow: data.cow };
    } else {
      const error = await response.json();
      return { success: false, message: error.error || "Cow not found." };
    }
  } catch (error) {
    console.error("Error fetching cow by ID:", error);
    return {
      success: false,
      message: "An error occurred while fetching the cow.",
    };
  }
};

// Fungsi untuk mendapatkan daftar semua sapi
export const listCows = async () => {
  try {
    const response = await fetch(`${API_URL1}/cow/list`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const data = await response.json();
      return { success: true, cows: data.cows };
    } else {
      const error = await response.json();
      return {
        success: false,
        message: error.error || "Failed to fetch cows.",
      };
    }
  } catch (error) {
    console.error("Error fetching cows:", error);
    return {
      success: false,
      message: "An error occurred while fetching the cows.",
    };
  }
};

// Fungsi untuk memperbarui data sapi berdasarkan ID
export const updateCow = async (cowId, cowData) => {
  try {
    const response = await fetch(`${API_URL1}/cow/update/${cowId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(cowData),
    });

    if (response.ok) {
      const data = await response.json();
      Swal.fire({
        icon: "success",
        title: "Success",
        text: data.message,
      });
      return { success: true, cow: data.cow };
    } else {
      const error = await response.json();
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.error || "Failed to update cow.",
      });
      return { success: false, message: error.error };
    }
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "An error occurred while updating the cow.",
    });
    console.error("Error updating cow:", error);
    return {
      success: false,
      message: "An error occurred while updating the cow.",
    };
  }
};

// Fungsi untuk menghapus sapi berdasarkan ID
export const deleteCow = async (cowId) => {
  try {
    const response = await fetch(`${API_URL1}/cow/delete/${cowId}`, {
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
        text: data.message,
      });
      return { success: true };
    } else {
      const error = await response.json();
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.error || "Failed to delete cow.",
      });
      return { success: false, message: error.error };
    }
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "An error occurred while deleting the cow.",
    });
    console.error("Error deleting cow:", error);
    return {
      success: false,
      message: "An error occurred while deleting the cow.",
    };
  }
};

// Fungsi untuk mengekspor Data Sapi ke PDF
export const exportCowsToPDF = async () => {
  try {
    const response = await fetch(`${API_URL1}/cow/export/pdf`, {
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
      a.download = "cows.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Cows exported to PDF successfully.",
      });
    } else {
      const error = await response.json();
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.error || "Failed to export cows to PDF.",
      });
    }
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "An error occurred while exporting cows to PDF.",
    });
    console.error("Error exporting cows to PDF:", error);
  }
};

// Fungsi untuk mengekspor Data Sapi ke Excel
export const exportCowsToExcel = async () => {
  try {
    const response = await fetch(`${API_URL1}/cow/export/excel`, {
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
      a.download = "cows.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Cows exported to Excel successfully.",
      });
    } else {
      const error = await response.json();
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.error || "Failed to export cows to Excel.",
      });
    }
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "An error occurred while exporting cows to Excel.",
    });
    console.error("Error exporting cows to Excel:", error);
  }
};
