import Swal from "sweetalert2";
import { API_URL2 } from "../../api/apiController.js";

// Get all product stocks
export const getProductStocks = async () => {
  try {
    const response = await fetch(`${API_URL2}/product-stock`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (response.ok) {
      const data = await response.json();
      return { success: true, productStocks: data };
    } else {
      const error = await response.json();
      const errorMessage =
        error.detail || error.error || "Failed to fetch product stocks.";
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
      text: "An error occurred while fetching product stocks.",
    });
    console.error("Error fetching product stocks:", error);
    return {
      success: false,
      message: "An error occurred while fetching product stocks.",
    };
  }
};

// Create a new product stock
export const createProductStock = async (formData) => {
  try {
    const response = await fetch(`${API_URL2}/product-stock`, {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      const result = await response.json();
      Swal.fire({
        icon: "success",
        title: "Success",
        text: result.message || "Product stock created successfully.",
      });
      return { success: true, data: result.data };
    } else {
      const error = await response.json();
      const errorMessage =
        error.detail || error.error || "Failed to create product stock.";
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
      text: "An error occurred while creating product stock.",
    });
    console.error("Error creating product stock:", error);
    return {
      success: false,
      message: "An error occurred while creating product stock.",
    };
  }
};

// Update a product stock
export const updateProductStock = async (id, formData) => {
  try {
    const response = await fetch(`${API_URL2}/product-stock/${id}/`, {
      method: "PUT",
      body: formData,
    });

    if (response.ok) {
      const result = await response.json();
      Swal.fire({
        icon: "success",
        title: "Success",
        text: result.message || "Product stock updated successfully.",
      });
      return { success: true, data: result.data };
    } else {
      const error = await response.json();
      const errorMessage =
        error.detail || error.error || "Failed to update product stock.";
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
      text: "An error occurred while updating product stock.",
    });
    console.error("Error updating product stock:", error);
    return {
      success: false,
      message: "An error occurred while updating product stock.",
    };
  }
};

// Delete a product stock
export const deleteProductStock = async (id) => {
  try {
    const response = await fetch(`${API_URL2}/product-stock/${id}/`, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
      },
    });

    if (response.ok) {
      // Handle 204 No Content or JSON response
      let result = {};
      if (response.status !== 204) {
        result = await response.json();
      } else {
        result = { message: "Product stock deleted successfully." };
      }
      Swal.fire({
        icon: "success",
        title: "Success",
        text: result.message || "Product stock deleted successfully.",
      });
      return { success: true, data: result };
    } else {
      const error = await response.json();
      const errorMessage =
        error.detail || error.error || "Failed to delete product stock.";
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
      text: "An error occurred while deleting product stock.",
    });
    console.error("Error deleting product stock:", error);
    return {
      success: false,
      message: "An error occurred while deleting product stock.",
    };
  }
};
