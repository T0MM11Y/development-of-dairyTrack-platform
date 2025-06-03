import Swal from "sweetalert2";
import { API_URL2 } from "../../api/apiController.js";

// Get product stock history
const getProductStockHistorys = async (queryString = "") => {
  try {
    const response = await fetch(
      `${API_URL2}/product-history/${queryString ? `?${queryString}` : ""}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      return { success: true, productHistory: data };
    } else {
      const error = await response.json();
      const errorMessage =
        error.detail || error.error || "Failed to fetch product stock history.";
      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
      });
      return { success: false, message: errorMessage };
    }
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "An error occurred while fetching product stock history.",
    });
    console.error("Error fetching product stock history:", error);
    return {
      success: false,
      message: "An error occurred while fetching product stock history.",
    };
  }
};

// Export product stock history as PDF
const getProductStockHistoryExportPdf = async (queryString = "") => {
  try {
    const response = await fetch(
      `${API_URL2}/product-history/export/pdf/${
        queryString ? `?${queryString}` : ""
      }`,
      {
        method: "GET",
        headers: {
          Accept: "application/pdf",
        },
      }
    );

    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `product_history_${new Date().toISOString()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Product stock history exported as PDF successfully.",
      });
      return { success: true, data: null };
    } else {
      const error = await response.json();
      const errorMessage =
        error.detail ||
        error.error ||
        "Failed to export product stock history as PDF.";
      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
      });
      return { success: false, message: errorMessage };
    }
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "An error occurred while exporting product stock history as PDF.",
    });
    console.error("Error exporting product stock history as PDF:", error);
    return {
      success: false,
      message:
        "An error occurred while exporting product stock history as PDF.",
    };
  }
};

// Export product stock history as Excel
const getProductStockHistoryExportExcel = async (queryString = "") => {
  try {
    const response = await fetch(
      `${API_URL2}/product-history/export/excel/${
        queryString ? `?${queryString}` : ""
      }`,
      {
        method: "GET",
        headers: {
          Accept:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        },
      }
    );

    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `product_history_${new Date().toISOString()}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Product stock history exported as Excel successfully.",
      });
      return { success: true, data: null };
    } else {
      const error = await response.json();
      const errorMessage =
        error.detail ||
        error.error ||
        "Failed to export product stock history as Excel.";
      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
      });
      return { success: false, message: errorMessage };
    }
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "An error occurred while exporting product stock history as Excel.",
    });
    console.error("Error exporting product stock history as Excel:", error);
    return {
      success: false,
      message:
        "An error occurred while exporting product stock history as Excel.",
    };
  }
};

export default {
  getProductStockHistorys,
  getProductStockHistoryExportPdf,
  getProductStockHistoryExportExcel,
};
