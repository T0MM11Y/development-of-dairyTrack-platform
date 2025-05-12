import { API_URL1 } from "../../api/apiController.js";
import Swal from "sweetalert2";

// Fungsi untuk mendapatkan semua blog
export const listBlogs = async () => {
  try {
    const response = await fetch(`${API_URL1}/blog/list`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const data = await response.json();
      // Mengurutkan blogs berdasarkan created_at secara descending
      const sortedBlogs = data.blogs.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      return { success: true, blogs: sortedBlogs };
    } else {
      const error = await response.json();
      return {
        success: false,
        message: error.error || "Failed to fetch blogs.",
      };
    }
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return {
      success: false,
      message: "An error occurred while fetching the blogs.",
    };
  }
};

// Fungsi untuk menambahkan blog baru
export const addBlog = async (blogData) => {
  try {
    const formData = new FormData();
    formData.append("title", blogData.title);
    formData.append("content", blogData.content);
    formData.append("photo", blogData.photo);

    const response = await fetch(`${API_URL1}/blog/add`, {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      const data = await response.json();
      Swal.fire({
        icon: "success",
        title: "Success",
        text: data.message,
      });
      return { success: true, blog: data.blog };
    } else {
      const error = await response.json();
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.error || "Failed to add blog.",
      });
      return { success: false, message: error.error };
    }
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "An error occurred while adding the blog.",
    });
    console.error("Error adding blog:", error);
    return {
      success: false,
      message: "An error occurred while adding the blog.",
    };
  }
};

// Fungsi untuk melayani file gambar blog
export const serveBlogImage = (filename) => {
  return `${API_URL1}/blog/uploads/blog/${filename}`;
};

// Fungsi untuk menghapus blog berdasarkan ID
export const deleteBlog = async (blogId) => {
  try {
    const response = await fetch(`${API_URL1}/blog/delete/${blogId}`, {
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
        text: error.error || "Failed to delete blog.",
      });
      return { success: false, message: error.error };
    }
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "An error occurred while deleting the blog.",
    });
    console.error("Error deleting blog:", error);
    return {
      success: false,
      message: "An error occurred while deleting the blog.",
    };
  }
};

// Fungsi untuk memperbarui blog berdasarkan ID
export const updateBlog = async (blogId, updatedData) => {
  try {
    const formData = new FormData();
    if (updatedData.title) formData.append("title", updatedData.title);
    if (updatedData.content) formData.append("content", updatedData.content);
    if (updatedData.photo) formData.append("photo", updatedData.photo);

    const response = await fetch(`${API_URL1}/blog/update/${blogId}`, {
      method: "PUT",
      body: formData,
    });

    if (response.ok) {
      const data = await response.json();
      Swal.fire({
        icon: "success",
        title: "Success",
        text: data.message,
      });
      return { success: true, blog: data.blog };
    } else {
      const error = await response.json();
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.error || "Failed to update blog.",
      });
      return { success: false, message: error.error };
    }
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "An error occurred while updating the blog.",
    });
    console.error("Error updating blog:", error);
    return {
      success: false,
      message: "An error occurred while updating the blog.",
    };
  }
};
