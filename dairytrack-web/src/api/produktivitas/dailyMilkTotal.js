import { fetchAPI } from "../apiClient";

// GET semua data daily milk totals
export const getDailyMilkTotals = () => fetchAPI("daily_milk_totals");

// GET satu daily milk total by ID
export const getDailyMilkTotalById = (id) =>
  fetchAPI(`daily_milk_totals/${id}`);

// GET semua data daily milk totals berdasarkan cow_id
export const getDailyMilkTotalsByCowId = async (cowId) => {
  try {
    // Panggil endpoint API untuk mendapatkan data daily milk totals berdasarkan cow_id
    const response = await fetchAPI(`daily_milk_totals/cow/${cowId}`);
    return response; // Kembalikan data yang diterima dari API
  } catch (error) {
    console.error(
      `Failed to fetch daily milk totals by cow_id (${cowId}):`,
      error.message
    );
    throw error; // Lempar error agar bisa ditangani di tempat lain
  }
};

// CREATE daily milk total baru
export const createDailyMilkTotal = (data) =>
  fetchAPI("daily_milk_totals", "POST", data);

// UPDATE daily milk total
export const updateDailyMilkTotal = (id, data) =>
  fetchAPI(`daily_milk_totals/${id}`, "PUT", data);

// DELETE daily milk total
export const deleteDailyMilkTotal = (id) =>
  fetchAPI(`daily_milk_totals/${id}`, "DELETE");

// GET low production notifications
export const getLowProductionNotifications = async () => {
  try {
    // Panggil endpoint API untuk mendapatkan notifikasi produksi rendah
    const response = await fetchAPI("daily_milk_totals/notifications");
    return response; // Kembalikan data yang diterima dari API
  } catch (error) {
    console.error(
      "Failed to fetch low production notifications:",
      error.message
    );
    throw error; // Lempar error agar bisa ditangani di tempat lain
  }
};
