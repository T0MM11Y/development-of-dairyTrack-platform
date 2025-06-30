import { API_URL4 } from "../../api/apiController.js";

export const addNutrition = async (nutritionData) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = user.token || null;
  console.log("addNutrition - Token:", token, "Data:", nutritionData);

  try {
    const response = await fetch(`${API_URL4}/nutrition`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(nutritionData),
    });

    const data = await response.json();
    return response.ok
      ? { success: true, nutrition: data.data || data.nutrition || {}, message: data.message || "Nutrisi berhasil ditambahkan." }
      : { success: false, message: data.message || "Gagal menambahkan nutrisi." };
  } catch (error) {
    console.error("addNutrition - Error:", error);
    return { success: false, message: "Terjadi kesalahan saat menambahkan nutrisi." };
  }
};

export const getNutritionById = async (nutritionId) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = user.token || null;
  console.log("getNutritionById - Token:", token, "ID:", nutritionId);

  try {
    const response = await fetch(`${API_URL4}/nutrition/${nutritionId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    return response.ok
      ? { success: true, nutrition: data.data }
      : { success: false, message: data.message || "Nutrisi tidak ditemukan." };
  } catch (error) {
    console.error("getNutritionById - Error:", error);
    return { success: false, message: "Terjadi kesalahan saat mengambil data nutrisi." };
  }
};

export const listNutritions = async () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = user.token || null;
  console.log("listNutritions - Token:", token);

  try {
    const response = await fetch(`${API_URL4}/nutrition`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    return response.ok
      ? { success: true, nutritions: data.data }
      : { success: false, message: data.message || "Gagal mengambil daftar nutrisi." };
  } catch (error) {
    console.error("listNutritions - Error:", error);
    return { success: false, message: "Terjadi kesalahan saat mengambil daftar nutrisi." };
  }
};

export const updateNutrition = async (nutritionId, nutritionData) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = user.token || null;
  console.log("updateNutrition - Token:", token, "ID:", nutritionId);

  try {
    const response = await fetch(`${API_URL4}/nutrition/${nutritionId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(nutritionData),
    });

    const data = await response.json();
    return response.ok
      ? { success: true, nutrition: data.data, message: data.message || "Nutrisi berhasil diperbarui." }
      : { success: false, message: data.message || "Gagal memperbarui nutrisi." };
  } catch (error) {
    console.error("updateNutrition - Error:", error);
    return { success: false, message: "Terjadi kesalahan saat memperbarui nutrisi." };
  }
};

export const deleteNutrition = async (nutritionId) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = user.token || null;
  console.log("deleteNutrition - Token:", token, "ID:", nutritionId);

  try {
    const response = await fetch(`${API_URL4}/nutrition/${nutritionId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    return response.ok
      ? { success: true, message: data.message || "Nutrisi berhasil dihapus." }
      : { success: false, message: data.message || "Gagal menghapus nutrisi." };
  } catch (error) {
    console.error("deleteNutrition - Error:", error);
    return { success: false, message: "Terjadi kesalahan saat menghapus nutrisi." };
  }
};
