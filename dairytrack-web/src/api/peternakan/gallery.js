import { fetchAPI } from "../apiClient";

// GET semua data gallery
export const getGalleries = () => fetchAPI("galleries");

// GET satu gallery by ID
export const getGalleryById = (id) => fetchAPI(`galleries/${id}`);

// CREATE gallery baru
export const createGallery = async (formData) => {
  try {
    const response = await fetchAPI("galleries", "POST", formData, true); // true untuk FormData

    if (!response.ok) {
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Terjadi kesalahan pada server.");
      } else {
        const errorText = await response.text();
        throw new Error(errorText || "Terjadi kesalahan pada server.");
      }
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return await response.json();
    } else {
      throw new Error("Respons dari server bukan JSON.");
    }
  } catch (error) {
    console.error("Error in createGallery:", error.message);
    throw error;
  }
};

// UPDATE gallery
export const updateGallery = async (id, formData) => {
  try {
    const response = await fetchAPI(`galleries/${id}`, "PUT", formData, true); // true untuk FormData

    if (!response.ok) {
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Terjadi kesalahan pada server.");
      } else {
        const errorText = await response.text();
        throw new Error(errorText || "Terjadi kesalahan pada server.");
      }
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return await response.json();
    } else {
      throw new Error("Respons dari server bukan JSON.");
    }
  } catch (error) {
    console.error("Error in updateGallery:", error.message);
    throw error;
  }
};

// DELETE gallery
export const deleteGallery = (id) => fetchAPI(`galleries/${id}`, "DELETE");

// GET gallery photo by ID
export const getGalleryPhoto = (id) => fetchAPI(`galleries/${id}/photo`);
