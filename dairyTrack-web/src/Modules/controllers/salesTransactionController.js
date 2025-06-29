import Swal from "sweetalert2";
import { API_URL2 } from "../../api/apiController.js";

// Get all sales transactions
const getSalesTransactions = async (queryString = "") => {
  try {
    const response = await fetch(
      `${API_URL2}/sales/sales-transactions/${
        queryString ? `?${queryString}` : ""
      }`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      return { success: true, salesTransactions: data };
    } else {
      const error = await response.json();
      const errorMessage =
        error.detail || error.error || "Failed to fetch sales transactions.";
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
      text: "An error occurred while fetching sales transactions.",
    });
    console.error("Error fetching sales transactions:", error);
    return {
      success: false,
      message: "An error occurred while fetching sales transactions.",
    };
  }
};

// Get a single sales transaction by ID
const getSalesTransactionById = async (id) => {
  try {
    const response = await fetch(
      `${API_URL2}/sales/sales-transactions/${id}/`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      return { success: true, salesTransaction: data };
    } else {
      const error = await response.json();
      const errorMessage =
        error.detail || error.error || "Failed to fetch sales transaction.";
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
      text: "An error occurred while fetching the sales transaction.",
    });
    console.error("Error fetching sales transaction:", error);
    return {
      success: false,
      message: "An error occurred while fetching the sales transaction.",
    };
  }
};

// Export sales transactions as PDF
const getSalesTransactionsExportPdf = async (queryString = "") => {
  try {
    const response = await fetch(
      `${API_URL2}/sales/sales-transactions/export/pdf/${
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
      link.download = `sales_transactions_${new Date().toISOString()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Sales transactions exported as PDF successfully.",
      });
      return { success: true, data: null };
    } else {
      const error = await response.json();
      const errorMessage =
        error.detail ||
        error.error ||
        "Failed to export sales transactions as PDF.";
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
      text: "An error occurred while exporting sales transactions as PDF.",
    });
    console.error("Error exporting sales transactions as PDF:", error);
    return {
      success: false,
      message: "An error occurred while exporting sales transactions as PDF.",
    };
  }
};

// Export sales transactions as Excel
const getSalesTransactionsExportExcel = async (queryString = "") => {
  try {
    const response = await fetch(
      `${API_URL2}/sales/sales-transactions/export/excel/${
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
      link.download = `sales_transactions_${new Date().toISOString()}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Sales transactions exported as Excel successfully.",
      });
      return { success: true, data: null };
    } else {
      const error = await response.json();
      const errorMessage =
        error.detail ||
        error.error ||
        "Failed to export sales transactions as Excel.";
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
      text: "An error occurred while exporting sales transactions as Excel.",
    });
    console.error("Error exporting sales transactions as Excel:", error);
    return {
      success: false,
      message: "An error occurred while exporting sales transactions as Excel.",
    };
  }
};

export default {
  getSalesTransactions,
  getSalesTransactionById,
  getSalesTransactionsExportPdf,
  getSalesTransactionsExportExcel,
};
