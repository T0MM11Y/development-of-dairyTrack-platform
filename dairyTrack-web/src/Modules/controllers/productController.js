import Swal from "sweetalert2";
import { fetchAPI } from "../apiClient1";

// Get all products
export const getProducts = async () => {
  try {
    const response = await fetchAPI("product");
    if (response.success) {
      return { success: true, products: response.data };
    } else {
      const errorMessage = response.message || "Failed to fetch products.";
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
      text: "An error occurred while fetching products.",
    });
    console.error("Error fetching products:", error);
    return {
      success: false,
      message: "An error occurred while fetching products.",
    };
  }
};

// Get product by ID
export const getProductById = async (id) => {
  try {
    const response = await fetchAPI(`product/${id}`);
    if (response.success) {
      return { success: true, product: response.data };
    } else {
      const errorMessage = response.message || "Failed to fetch product.";
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
      text: "An error occurred while fetching product.",
    });
    console.error("Error fetching product:", error);
    return {
      success: false,
      message: "An error occurred while fetching product.",
    };
  }
};

// Create a new product
export const createProduct = async (formData) => {
  try {
    const response = await fetchAPI("product", "POST", formData);
    if (response.success) {
      Swal.fire({
        icon: "success",
        title: "Success",
        text: response.message || "Product created successfully.",
      });
      return { success: true, data: response.data };
    } else {
      const errorMessage = response.message || "Failed to create product.";
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
      text: "An error occurred while creating product.",
    });
    console.error("Error creating product:", error);
    return {
      success: false,
      message: "An error occurred while creating product.",
    };
  }
};

// Update a product
export const updateProduct = async (id, formData) => {
  try {
    const response = await fetchAPI(`product/${id}/`, "PUT", formData);
    if (response.success) {
      Swal.fire({
        icon: "success",
        title: "Success",
        text: response.message || "Product updated successfully.",
      });
      return { success: true, data: response.data };
    } else {
      const errorMessage = response.message || "Failed to update product.";
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
      text: "An error occurred while updating product.",
    });
    console.error("Error updating product:", error);
    return {
      success: false,
      message: "An error occurred while updating product.",
    };
  }
};

// Delete a product
export const deleteProduct = async (id) => {
  try {
    const response = await fetchAPI(`product/${id}/`, "DELETE");
    if (response.success) {
      Swal.fire({
        icon: "success",
        title: "Success",
        text: response.message || "Product deleted successfully.",
      });
      return { success: true, data: response.data || {} };
    } else {
      const errorMessage = response.message || "Failed to delete product.";
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
      text: "An error occurred while deleting product.",
    });
    console.error("Error deleting product:", error);
    return {
      success: false,
      message: "An error occurred while deleting product.",
    };
  }
};

// Get product history
export const getProductHistorys = async (queryString = "") => {
  try {
    const response = await fetchAPI(`product-history/${queryString ? `?${queryString}` : ""}`);
    if (response.success) {
      return { success: true, productHistorys: response.data };
    } else {
      const errorMessage = response.message || "Failed to fetch product history.";
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
      text: "An error occurred while fetching product history.",
    });
    console.error("Error fetching product history:", error);
    return {
      success: false,
      message: "An error occurred while fetching product history.",
    };
  }
};

// Export product history to PDF
export const getProductHistoryExportPdf = async (queryString = "") => {
  try {
    const response = await fetchAPI(
      `product-history/export/pdf/${queryString ? `?${queryString}` : ""}`,
      "GET",
      null,
      true
    );
    if (response.success) {
      return { success: true, data: response.data };
    } else {
      const errorMessage = response.message || "Failed to export product history to PDF.";
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
      text: "An error occurred while exporting product history to PDF.",
    });
    console.error("Error exporting product history to PDF:", error);
    return {
      success: false,
      message: "An error occurred while exporting product history to PDF.",
    };
  }
};

// Export product history to Excel
export const getProductHistoryExportExcel = async (queryString = "") => {
  try {
    const response = await fetchAPI(
      `product-history/export/excel/${queryString ? `?${queryString}` : ""}`,
      "GET",
      null,
      true
    );
    if (response.success) {
      return { success: true, data: response.data };
    } else {
      const errorMessage = response.message || "Failed to export product history to Excel.";
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
      text: "An error occurred while exporting product history to Excel.",
    });
    console.error("Error exporting product history to Excel:", error);
    return {
      success: false,
      message: "An error occurred while exporting product history to Excel.",
    };
  }
};