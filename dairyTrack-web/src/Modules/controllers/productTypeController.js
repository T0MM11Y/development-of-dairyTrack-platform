import Swal from "sweetalert2";
import { API_URL2 } from "../../api/apiController.js";

// Get all product types
export const getProductTypes = async () => {
  try {
    const response = await fetch(`${API_URL2}/product-type`, {
      method: "GET",
    });

    if (response.ok) {
      const data = await response.json();
      return { success: true, productTypes: data };
    } else {
      const error = await response.json();
      const errorMessage =
        error.detail || error.error || "Failed to fetch product types.";
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
      text: "An error occurred while fetching product types.",
    });
    console.error("Error fetching product types:", error);
    return {
      success: false,
      message: "An error occurred while fetching product types.",
    };
  }
};

// Get product type by ID
export const getProductTypeById = async (id) => {
  try {
    const response = await fetch(`${API_URL2}/product-type/${id}`, {
      method: "GET",
    });

    if (response.ok) {
      const data = await response.json();
      return { success: true, productType: data };
    } else {
      const error = await response.json();
      const errorMessage =
        error.detail || error.error || "Failed to fetch product type.";
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
      text: "An error occurred while fetching product type.",
    });
    console.error("Error fetching product type:", error);
    return {
      success: false,
      message: "An error occurred while fetching product type.",
    };
  }
};

// Create a new product type
export const createProductType = async (formData) => {
  try {
    const response = await fetch(`${API_URL2}/product-type`, {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      const result = await response.json();
      Swal.fire({
        icon: "success",
        title: "Success",
        text: result.message || "Product type created successfully.",
      });
      return { success: true, data: result.data };
    } else {
      const error = await response.json();
      const errorMessage =
        error.detail || error.error || "Failed to create product type.";
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
      text: "An error occurred while creating product type.",
    });
    console.error("Error creating product type:", error);
    return {
      success: false,
      message: "An error occurred while creating product type.",
    };
  }
};

// Update a product type
export const updateProductType = async (id, formData) => {
  try {
    const response = await fetch(`${API_URL2}/product-type/${id}/`, {
      method: "PUT",
      body: formData,
    });

    if (response.ok) {
      const result = await response.json();
      Swal.fire({
        icon: "success",
        title: "Success",
        text: result.message || "Product type updated successfully.",
      });
      return { success: true, data: result.data };
    } else {
      const error = await response.json();
      const errorMessage =
        error.detail || error.error || "Failed to update product type.";
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
      text: "An error occurred while updating product type.",
    });
    console.error("Error updating product type:", error);
    return {
      success: false,
      message: "An error occurred while updating product type.",
    };
  }
};

// Delete a product type
export const deleteProductType = async (id) => {
  try {
    const response = await fetch(`${API_URL2}/product-type/${id}/`, {
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
        result = { message: "Product type deleted successfully." };
      }
      Swal.fire({
        icon: "success",
        title: "Success",
        text: result.message || "Product type deleted successfully.",
      });
      return { success: true, data: result };
    } else {
      const error = await response.json();
      const errorMessage =
        error.detail || error.error || "Failed to delete product type.";
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
      text: "An error occurred while deleting product type.",
    });
    console.error("Error deleting product type:", error);
    return {
      success: false,
      message: "An error occurred while deleting product type.",
    };
  }
};
