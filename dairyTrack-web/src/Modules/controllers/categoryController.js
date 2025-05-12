import { API_URL1 } from "../../api/apiController.js";
import Swal from "sweetalert2";

// Fungsi untuk mendapatkan semua kategori
export const listCategories = async () => {
  try {
    const response = await fetch(`${API_URL1}/category/list`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const data = await response.json();
      return { success: true, categories: data.categories };
    } else {
      const error = await response.json();
      return {
        success: false,
        message: error.error || "Failed to fetch categories.",
      };
    }
  } catch (error) {
    console.error("Error fetching categories:", error);
    return {
      success: false,
      message: "An error occurred while fetching the categories.",
    };
  }
};

// Fungsi untuk menambahkan kategori baru
export const addCategory = async (categoryData) => {
  try {
    const response = await fetch(`${API_URL1}/category/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(categoryData),
    });

    if (response.ok) {
      const data = await response.json();
      Swal.fire({
        icon: "success",
        title: "Success",
        text: data.message,
      });
      return { success: true, category: data.category };
    } else {
      const error = await response.json();
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.error || "Failed to add category.",
      });
      return { success: false, message: error.error };
    }
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "An error occurred while adding the category.",
    });
    console.error("Error adding category:", error);
    return {
      success: false,
      message: "An error occurred while adding the category.",
    };
  }
};

// Fungsi untuk memperbarui kategori berdasarkan ID
export const updateCategory = async (categoryId, updatedData) => {
  try {
    const response = await fetch(`${API_URL1}/category/update/${categoryId}`, {
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
        text: data.message,
      });
      return { success: true, category: data.category };
    } else {
      const error = await response.json();
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.error || "Failed to update category.",
      });
      return { success: false, message: error.error };
    }
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "An error occurred while updating the category.",
    });
    console.error("Error updating category:", error);
    return {
      success: false,
      message: "An error occurred while updating the category.",
    };
  }
};

// Fungsi untuk menghapus kategori berdasarkan ID
export const deleteCategory = async (categoryId) => {
  try {
    const response = await fetch(`${API_URL1}/category/delete/${categoryId}`, {
      method: "DELETE",
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
        text: error.error || "Failed to delete category.",
      });
      return { success: false, message: error.error };
    }
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "An error occurred while deleting the category.",
    });
    console.error("Error deleting category:", error);
    return {
      success: false,
      message: "An error occurred while deleting the category.",
    };
  }
};

// Fungsi untuk mendapatkan kategori berdasarkan ID
export const getCategoryById = async (categoryId) => {
  try {
    const response = await fetch(`${API_URL1}/category/${categoryId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const data = await response.json();
      return { success: true, category: data.category };
    } else {
      const error = await response.json();
      return {
        success: false,
        message: error.error || "Failed to fetch category.",
      };
    }
  } catch (error) {
    console.error("Error fetching category:", error);
    return {
      success: false,
      message: "An error occurred while fetching the category.",
    };
  }
};

// Fungsi untuk mendapatkan semua blog dalam kategori tertentu
export const getCategoryBlogs = async (categoryId) => {
  try {
    const response = await fetch(`${API_URL1}/category/${categoryId}/blogs`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const data = await response.json();
      return { success: true, blogs: data.blogs };
    } else {
      const error = await response.json();
      return {
        success: false,
        message: error.error || "Failed to fetch blogs for category.",
      };
    }
  } catch (error) {
    console.error("Error fetching category blogs:", error);
    return {
      success: false,
      message: "An error occurred while fetching the blogs for the category.",
    };
  }
};
