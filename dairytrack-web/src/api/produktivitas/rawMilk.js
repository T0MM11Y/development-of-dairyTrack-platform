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

// CHECK apakah raw milk sudah expired
export const checkRawMilkExpired = async (id) => {
  try {
    // Panggil endpoint API untuk memeriksa status expired
    const response = await fetchAPI(`raw_milks/${id}/is_expired`, "GET");
    return response; // Kembalikan data yang diterima dari API
  } catch (error) {
    console.error(
      `Failed to check expiration status for raw milk ID (${id}):`,
      error.message
    );
    throw error; // Lempar error agar bisa ditangani di tempat lain
  }
};
// GET today's last session by cow_id
export const getTodayLastSessionByCowId = async (cowId) => {
  try {
    // Panggil endpoint API untuk mendapatkan sesi terakhir hari ini berdasarkan cow_id
    const response = await fetchAPI(`raw_milks/today_last_session/${cowId}`);
    return response; // Kembalikan data yang diterima dari API
  } catch (error) {
    console.error(
      `Failed to fetch today's last session for cow_id (${cowId}):`,
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

// DELETE raw milk
export const deleteRawMilk = (id) => fetchAPI(`raw_milks/${id}`, "DELETE");
