import { API_URL1 } from "../../api/apiController.js";
import Swal from "sweetalert2";

// Function to add a new milking session
export const addMilkingSession = async (sessionData) => {
  try {
    const response = await fetch(
      `${API_URL1}/milk-production/milking-sessions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sessionData),
      }
    );

    if (response.ok) {
      const data = await response.json();
      Swal.fire({
        icon: "success",
        title: "Success",
        text: data.message,
      });
      return { success: true, id: data.id, message: data.message };
    } else {
      const error = await response.json();
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.error || "Failed to add milking session.",
      });
      return { success: false, message: error.error };
    }
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "An error occurred while adding the milking session.",
    });
    console.error("Error adding milking session:", error);
    return {
      success: false,
      message: "An error occurred while adding the milking session.",
    };
  }
};

// Function to get all milking sessions
export const getMilkingSessions = async () => {
  try {
    const response = await fetch(
      `${API_URL1}/milk-production/milking-sessions`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      return { success: true, sessions: data.sessions || data }; // Handle both formats
    } else {
      const error = await response.json();
      return { success: false, message: error.error };
    }
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "An error occurred while fetching milking sessions.",
    });
    console.error("Error fetching milking sessions:", error);
    return {
      success: false,
      message: "An error occurred while fetching milking sessions.",
    };
  }
};

// Function to get all milk batches
export const getMilkBatches = async () => {
  try {
    const response = await fetch(`${API_URL1}/milk-production/milk-batches`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const data = await response.json();
      return { success: true, batches: data.batches || data }; // Handle both formats
    } else {
      const error = await response.json();
      return { success: false, message: error.error };
    }
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "An error occurred while fetching milk batches.",
    });
    console.error("Error fetching milk batches:", error);
    return {
      success: false,
      message: "An error occurred while fetching milk batches.",
    };
  }
};

// Function to get daily milk summaries with optional filters
export const getDailySummaries = async (filters = {}) => {
  try {
    // Build query string from filters
    const queryParams = new URLSearchParams();
    if (filters.cow_id) queryParams.append("cow_id", filters.cow_id);
    if (filters.start_date)
      queryParams.append("start_date", filters.start_date);
    if (filters.end_date) queryParams.append("end_date", filters.end_date);

    const queryString = queryParams.toString();
    const url = `${API_URL1}/milk-production/daily-summaries${
      queryString ? "?" + queryString : ""
    }`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const data = await response.json();
      return { success: true, summaries: data };
    } else {
      const error = await response.json();
      return { success: false, message: error.error };
    }
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "An error occurred while fetching daily milk summaries.",
    });
    console.error("Error fetching daily milk summaries:", error);
    return {
      success: false,
      message: "An error occurred while fetching daily milk summaries.",
    };
  }
};

// Function to export milk production data to PDF
export const exportMilkProductionToPDF = async () => {
  try {
    const response = await fetch(`${API_URL1}/milk-production/export/pdf`, {
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
      a.download = "milk-production.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Milk production data exported to PDF successfully.",
      });
      return { success: true };
    } else {
      const error = await response.json();
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.error || "Failed to export milk production data to PDF.",
      });
      return { success: false, message: error.error };
    }
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "An error occurred while exporting milk production data to PDF.",
    });
    console.error("Error exporting milk production data to PDF:", error);
    return { success: false, message: "Export failed" };
  }
};

// Function to export milk production data to Excel
export const exportMilkProductionToExcel = async () => {
  try {
    const response = await fetch(`${API_URL1}/milk-production/export/excel`, {
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
      a.download = "milk-production.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Milk production data exported to Excel successfully.",
      });
      return { success: true };
    } else {
      const error = await response.json();
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.error || "Failed to export milk production data to Excel.",
      });
      return { success: false, message: error.error };
    }
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "An error occurred while exporting milk production data to Excel.",
    });
    console.error("Error exporting milk production data to Excel:", error);
    return { success: false, message: "Export failed" };
  }
};

// Function to delete a milking session
export const deleteMilkingSession = async (sessionId) => {
  try {
    // Confirmation dialog before deletion
    const confirmResult = await Swal.fire({
      title: "Are you sure?",
      text: "This will permanently delete this milking session and update related data. This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    // If user cancels the deletion
    if (!confirmResult.isConfirmed) {
      return { success: false, canceled: true };
    }

    // User confirmed, proceed with deletion
    const response = await fetch(
      `${API_URL1}/milk-production/milking-sessions/${sessionId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: "The milking session has been deleted successfully.",
        timer: 2000,
        timerProgressBar: true,
      });
      return { success: true, message: data.message };
    } else {
      const error = await response.json();
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.error || "Failed to delete the milking session.",
      });
      return { success: false, message: error.error };
    }
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "An error occurred while deleting the milking session.",
    });
    console.error("Error deleting milking session:", error);
    return {
      success: false,
      message: "An error occurred while deleting the milking session.",
    };
  }
};

// Function to edit a milking session
export const editMilkingSession = async (sessionId, sessionData) => {
  try {
    const response = await fetch(
      `${API_URL1}/milk-production/milking-sessions/${sessionId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sessionData),
      }
    );

    if (response.ok) {
      const data = await response.json();
      Swal.fire({
        icon: "success",
        title: "Success",
        text: data.message,
      });
      return { success: true, message: data.message };
    } else {
      const error = await response.json();
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.error || "Failed to edit milking session.",
      });
      return { success: false, message: error.error };
    }
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "An error occurred while editing the milking session.",
    });
    console.error("Error editing milking session:", error);
    return {
      success: false,
      message: "An error occurred while editing the milking session.",
    };
  }
};

// Function to export daily milk summaries to PDF with optional filters
export const exportDailySummariesToPDF = async (filters = {}) => {
  try {
    // Build query string from filters
    const queryParams = new URLSearchParams();
    if (filters.cow_id) queryParams.append("cow_id", filters.cow_id);
    if (filters.start_date)
      queryParams.append("start_date", filters.start_date);
    if (filters.end_date) queryParams.append("end_date", filters.end_date);

    const queryString = queryParams.toString();
    const url = `${API_URL1}/milk-production/export/daily-summaries/pdf${
      queryString ? "?" + queryString : ""
    }`;

    const response = await fetch(url, {
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

      // Generate appropriate filename based on filters
      let filename = "daily_milk_production.pdf";
      if (filters.start_date && filters.end_date) {
        filename = `milk_production_${filters.start_date}_to_${filters.end_date}.pdf`;
      } else if (filters.cow_id) {
        filename = `milk_production_cow_${filters.cow_id}.pdf`;
      }

      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Daily milk summaries exported to PDF successfully.",
      });
      return { success: true };
    } else {
      const error = await response.json();
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.error || "Failed to export daily milk summaries to PDF.",
      });
      return { success: false, message: error.error };
    }
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "An error occurred while exporting daily milk summaries to PDF.",
    });
    console.error("Error exporting daily milk summaries to PDF:", error);
    return { success: false, message: "Export failed" };
  }
};

// Function to export daily milk summaries to Excel with optional filters
export const exportDailySummariesToExcel = async (filters = {}) => {
  try {
    // Build query string from filters
    const queryParams = new URLSearchParams();
    if (filters.cow_id) queryParams.append("cow_id", filters.cow_id);
    if (filters.start_date)
      queryParams.append("start_date", filters.start_date);
    if (filters.end_date) queryParams.append("end_date", filters.end_date);

    const queryString = queryParams.toString();
    const url = `${API_URL1}/milk-production/export/daily-summaries/excel${
      queryString ? "?" + queryString : ""
    }`;

    const response = await fetch(url, {
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

      // Generate appropriate filename based on filters
      let filename = "daily_milk_production.xlsx";
      if (filters.start_date && filters.end_date) {
        filename = `milk_production_${filters.start_date}_to_${filters.end_date}.xlsx`;
      } else if (filters.cow_id) {
        filename = `milk_production_cow_${filters.cow_id}.xlsx`;
      }

      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Daily milk summaries exported to Excel successfully.",
      });
      return { success: true };
    } else {
      const error = await response.json();
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.error || "Failed to export daily milk summaries to Excel.",
      });
      return { success: false, message: error.error };
    }
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "An error occurred while exporting daily milk summaries to Excel.",
    });
    console.error("Error exporting daily milk summaries to Excel:", error);
    return { success: false, message: "Export failed" };
  }
};
