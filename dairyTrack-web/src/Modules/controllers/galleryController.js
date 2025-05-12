import { API_URL1 } from "../../api/apiController.js";
import Swal from "sweetalert2";

// Fungsi untuk mendapatkan semua galeri
export const listGalleries = async () => {
  try {
    const response = await fetch(`${API_URL1}/gallery/list`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const data = await response.json();
      return { success: true, galleries: data };
    } else {
      const error = await response.json();
      return {
        success: false,
        message: error.error || "Failed to fetch galleries.",
      };
    }
  } catch (error) {
    console.error("Error fetching galleries:", error);
    return {
      success: false,
      message: "An error occurred while fetching the galleries.",
    };
  }
};

// Fungsi untuk menambahkan galeri baru
export const addGallery = async (galleryData) => {
  try {
    const formData = new FormData();
    formData.append("title", galleryData.title);
    formData.append("image", galleryData.image);

    const response = await fetch(`${API_URL1}/gallery/add`, {
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
      return { success: true, gallery: data.gallery };
    } else {
      const error = await response.json();
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.error || "Failed to add gallery.",
      });
      return { success: false, message: error.error };
    }
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "An error occurred while adding the gallery.",
    });
    console.error("Error adding gallery:", error);
    return {
      success: false,
      message: "An error occurred while adding the gallery.",
    };
  }
};

// Fungsi untuk melayani file gambar
export const serveGalleryImage = (filename) => {
  return `${API_URL1}/gallery/uploads/gallery/${filename}`;
};

// Fungsi untuk menghapus galeri berdasarkan ID
export const deleteGallery = async (galleryId) => {
  try {
    const response = await fetch(`${API_URL1}/gallery/delete/${galleryId}`, {
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
        text: error.error || "Failed to delete gallery.",
      });
      return { success: false, message: error.error };
    }
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "An error occurred while deleting the gallery.",
    });
    console.error("Error deleting gallery:", error);
    return {
      success: false,
      message: "An error occurred while deleting the gallery.",
    };
  }
};

// Fungsi untuk memperbarui galeri berdasarkan ID
export const updateGallery = async (galleryId, updatedData) => {
  try {
    const formData = new FormData();
    if (updatedData.title) formData.append("title", updatedData.title);
    if (updatedData.image) formData.append("image", updatedData.image);

    const response = await fetch(`${API_URL1}/gallery/update/${galleryId}`, {
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
      return { success: true, gallery: data.gallery };
    } else {
      const error = await response.json();
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.error || "Failed to update gallery.",
      });
      return { success: false, message: error.error };
    }
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "An error occurred while updating the gallery.",
    });
    console.error("Error updating gallery:", error);
    return {
      success: false,
      message: "An error occurred while updating the gallery.",
    };
  }
};
