import { fetchAPI } from "../apiClient";

// GET semua data blog
export const getBlogs = () => fetchAPI("blogs");

// GET satu blog by ID
export const getBlogById = (id) => fetchAPI(`blogs/${id}`);

// CREATE blog baru
export const createBlog = async (formData) => {
  try {
    const response = await fetchAPI("blogs", "POST", formData, true); // true untuk FormData

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
    console.error("Error in createBlog:", error.message);
    throw error;
  }
};
// UPDATE blog
export const updateBlog = async (id, formData) => {
  try {
    const response = await fetchAPI(`blogs/${id}`, "PUT", formData, true); // true untuk FormData

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
    console.error("Error in updateBlog:", error.message);
    throw error;
  }
};
// DELETE blog
export const deleteBlog = (id) => fetchAPI(`blogs/${id}`, "DELETE");

// GET blog photo by ID
export const getBlogPhoto = (id) => fetchAPI(`blogs/${id}/photo`);
