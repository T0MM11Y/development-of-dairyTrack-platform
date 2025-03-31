import { fetchAPI } from "../apiClient";

// GET semua data raw milk
export const getRawMilks = () => fetchAPI("raw_milks");

// GET satu raw milk by ID
export const getRawMilkById = (id) => fetchAPI(`raw_milks/${id}`);

// GET semua data raw milk berdasarkan cow_id
export const getRawMilksByCowId = async (cowId) => {
  try {
    // Panggil endpoint API untuk mendapatkan data raw milk berdasarkan cow_id
    const response = await fetchAPI(`raw_milks/cow/${cowId}`);
    return response; // Kembalikan data yang diterima dari API
  } catch (error) {
    console.error(
      `Failed to fetch raw milks by cow_id (${cowId}):`,
      error.message
    );
    throw error; // Lempar error agar bisa ditangani di tempat lain
  }
};
// CREATE raw milk baru
export const createRawMilk = (data) => fetchAPI("raw_milks", "POST", data);

// UPDATE raw milk
export const updateRawMilk = (id, data) =>
  fetchAPI(`raw_milks/${id}`, "PUT", data);

// GET session terakhir hari ini berdasarkan cow_id
export const getTodayLastSessionbyCowID = async (cowId) => {
  try {
    // Panggil endpoint API untuk mendapatkan session terakhir hari ini
    const response = await fetchAPI(`raw_milks/today_last_session/${cowId}`);
    return response;
  } catch (error) {
    console.error(
      `Failed to fetch today's last session for cow_id (${cowId}):`,
      error.message
    );
    throw error; // Lempar error agar bisa ditangani di tempat lain
  }
};

// DELETE raw milk
export const deleteRawMilk = (id) => fetchAPI(`raw_milks/${id}`, "DELETE");
