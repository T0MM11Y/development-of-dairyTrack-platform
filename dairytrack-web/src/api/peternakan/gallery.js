import { fetchAPI } from "../apiClient";

// GET semua data gallery
export const getGalleries = () => fetchAPI("galleries");

// GET satu gallery by ID
export const getGalleryById = (id) => fetchAPI(`galleries/${id}`);

// CREATE gallery baru
export const createGallery = async (formData) => {
  try {
    return await fetchAPI("galleries", "POST", formData, true);
  } catch (error) {
    console.error("Error in createGallery:", error.message);
    throw error;
  }
};

// UPDATE gallery
export const updateGallery = async (id, formData) => {
  try {
    return await fetchAPI(`galleries/${id}`, "PUT", formData, true);
  } catch (error) {
    console.error("Error in updateGallery:", error.message);
    throw error;
  }
};

// DELETE gallery
export const deleteGallery = (id) => fetchAPI(`galleries/${id}`, "DELETE");

// GET gallery photo by ID
export const getGalleryPhoto = (id) => fetchAPI(`galleries/${id}/photo`);
