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
