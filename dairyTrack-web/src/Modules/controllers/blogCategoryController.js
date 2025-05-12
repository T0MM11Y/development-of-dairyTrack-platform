import { API_URL1 } from "../../api/apiController.js";
import Swal from "sweetalert2";

// Fungsi untuk menetapkan kategori ke blog
export const assignCategoryToBlog = async (blogId, categoryId) => {
  try {
    const response = await fetch(`${API_URL1}/blog-category/assign`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ blog_id: blogId, category_id: categoryId }),
    });

    if (response.ok) {
      const data = await response.json();
      Swal.fire({
        icon: "success",
        title: "Success",
        text: data.message,
      });
      return { success: true, data };
    } else {
      const error = await response.json();
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.error || "Failed to assign category to blog.",
      });
      return { success: false, message: error.error };
    }
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "An error occurred while assigning the category to the blog.",
    });
    console.error("Error assigning category to blog:", error);
    return {
      success: false,
      message: "An error occurred while assigning the category to the blog.",
    };
  }
};

// Fungsi untuk menghapus kategori dari blog
export const removeCategoryFromBlog = async (blogId, categoryId) => {
  try {
    const response = await fetch(`${API_URL1}/blog-category/remove`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ blog_id: blogId, category_id: categoryId }),
    });

    if (response.ok) {
      const data = await response.json();
      Swal.fire({
        icon: "success",
        title: "Success",
        text: data.message,
      });
      return { success: true, data };
    } else {
      const error = await response.json();
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.error || "Failed to remove category from blog.",
      });
      return { success: false, message: error.error };
    }
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "An error occurred while removing the category from the blog.",
    });
    console.error("Error removing category from blog:", error);
    return {
      success: false,
      message: "An error occurred while removing the category from the blog.",
    };
  }
};

// Fungsi untuk mendapatkan semua kategori dari blog tertentu
export const getBlogCategories = async (blogId) => {
  try {
    const response = await fetch(
      `${API_URL1}/blog-category/blog/${blogId}/categories`,
      {
        method: "GET",
      }
    );

    if (response.ok) {
      const data = await response.json();
      return { success: true, categories: data.categories };
    } else {
      const error = await response.json();
      return {
        success: false,
        message: error.error || "Failed to fetch blog categories.",
      };
    }
  } catch (error) {
    console.error("Error fetching blog categories:", error);
    return {
      success: false,
      message: "An error occurred while fetching the blog categories.",
    };
  }
};

// Fungsi untuk mendapatkan semua blog dari kategori tertentu
export const getCategoryBlogs = async (categoryId) => {
  try {
    const response = await fetch(
      `${API_URL1}/blog-category/category/${categoryId}/blogs`,
      {
        method: "GET",
      }
    );

    if (response.ok) {
      const data = await response.json();
      return { success: true, blogs: data.blogs };
    } else {
      const error = await response.json();
      return {
        success: false,
        message: error.error || "Failed to fetch category blogs.",
      };
    }
  } catch (error) {
    console.error("Error fetching category blogs:", error);
    return {
      success: false,
      message: "An error occurred while fetching the category blogs.",
    };
  }
};

// Fungsi untuk menetapkan beberapa kategori ke blog
export const bulkAssignCategories = async (
  blogId,
  categoryIds,
  replace = false
) => {
  try {
    const response = await fetch(`${API_URL1}/blog-category/bulk-assign`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        blog_id: blogId,
        category_ids: categoryIds,
        replace,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      Swal.fire({
        icon: "success",
        title: "Success",
        text: data.message,
      });
      return { success: true, data };
    } else {
      const error = await response.json();
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.error || "Failed to bulk assign categories.",
      });
      return { success: false, message: error.error };
    }
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "An error occurred while bulk assigning categories.",
    });
    console.error("Error bulk assigning categories:", error);
    return {
      success: false,
      message: "An error occurred while bulk assigning categories.",
    };
  }
};

// Fungsi untuk mendapatkan semua relasi blog-kategori
export const listBlogCategories = async () => {
  try {
    const response = await fetch(`${API_URL1}/blog-category/list`, {
      method: "GET",
    });

    if (response.ok) {
      const data = await response.json();
      return { success: true, relationships: data.relationships };
    } else {
      const error = await response.json();
      return {
        success: false,
        message: error.error || "Failed to fetch blog-category relationships.",
      };
    }
  } catch (error) {
    console.error("Error fetching blog-category relationships:", error);
    return {
      success: false,
      message:
        "An error occurred while fetching the blog-category relationships.",
    };
  }
};
