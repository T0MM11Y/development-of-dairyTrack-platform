import Swal from "sweetalert2";
import { API_URL2 } from "../../api/apiController.js";

// Get all sales transactions
export const getSalesTransactions = async () => {
  try {
    const response = await fetch(`${API_URL2}/finance/sales-transactions/`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

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
export const getSalesTransactionById = async (id) => {
  try {
    const response = await fetch(
      `${API_URL2}/finance/sales-transactions/${id}/`,
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

// Create a new sales transaction
export const createSalesTransaction = async (data) => {
  try {
    const response = await fetch(`${API_URL2}/finance/sales-transactions/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      const result = await response.json();
      Swal.fire({
        icon: "success",
        title: "Success",
        text: result.message || "Sales transaction created successfully.",
      });
      return { success: true, data: result.data || result };
    } else {
      const error = await response.json();
      const errorMessage =
        error.detail || error.error || "Failed to create sales transaction.";
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
      text: "An error occurred while creating the sales transaction.",
    });
    console.error("Error creating sales transaction:", error);
    return {
      success: false,
      message: "An error occurred while creating the sales transaction.",
    };
  }
};

// Update an existing sales transaction
export const updateSalesTransaction = async (id, data) => {
  try {
    const response = await fetch(
      `${API_URL2}/finance/sales-transactions/${id}/`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(data),
      }
    );

    if (response.ok) {
      const result = await response.json();
      Swal.fire({
        icon: "success",
        title: "Success",
        text: result.message || "Sales transaction updated successfully.",
      });
      return { success: true, data: result.data || result };
    } else {
      const error = await response.json();
      const errorMessage =
        error.detail || error.error || "Failed to update sales transaction.";
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
      text: "An error occurred while updating the sales transaction.",
    });
    console.error("Error updating sales transaction:", error);
    return {
      success: false,
      message: "An error occurred while updating the sales transaction.",
    };
  }
};

// Delete a sales transaction
export const deleteSalesTransaction = async (id) => {
  try {
    const response = await fetch(
      `${API_URL2}/finance/sales-transactions/${id}/`,
      {
        method: "DELETE",
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (response.ok) {
      // Handle 204 No Content or JSON response
      let result = {};
      if (response.status !== 204) {
        result = await response.json();
      } else {
        result = { message: "Sales transaction deleted successfully." };
      }
      Swal.fire({
        icon: "success",
        title: "Success",
        text: result.message || "Sales transaction deleted successfully.",
      });
      return { success: true, data: result };
    } else {
      const error = await response.json();
      const errorMessage =
        error.detail || error.error || "Failed to delete sales transaction.";
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
      text: "An error occurred while deleting the sales transaction.",
    });
    console.error("Error deleting sales transaction:", error);
    return {
      success: false,
      message: "An error occurred while deleting the sales transaction.",
    };
  }
};
