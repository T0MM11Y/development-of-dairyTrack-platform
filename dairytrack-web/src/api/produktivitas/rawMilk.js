import { fetchAPI } from "../apiClient";

export const getRawMilks = () => fetchAPI("raw_milks");

export const getRawMilkById = (id) => fetchAPI(`raw_milks/${id}`);

export const getRawMilksByCowId = async (cowId) => {
  try {
    const response = await fetchAPI(`raw_milks/cow/${cowId}`);
    return response;
  } catch (error) {
    console.error(
      `Failed to fetch raw milks by cow_id (${cowId}):`,
      error.message
    );
    throw error;
  }
};

export const checkRawMilkExpired = async (id) => {
  try {
    const response = await fetchAPI(`raw_milks/${id}/is_expired`, "GET");
    return response;
  } catch (error) {
    console.error(
      `Failed to check expiration status for raw milk ID (${id}):`,
      error.message
    );
    throw error;
  }
};

export const getTodayLastSessionByCowId = async (cowId) => {
  try {
    const response = await fetchAPI(`raw_milks/today_last_session/${cowId}`);
    return response;
  } catch (error) {
    console.error(
      `Failed to fetch today's last session for cow_id (${cowId}):`,
      error.message
    );
    throw error;
  }
};

export const getAllRawMilksWithExpiredStatus = async () => {
  try {
    const response = await fetchAPI("raw_milks/expired_status", "GET");
    return response;
  } catch (error) {
    console.error(
      "Failed to fetch all raw milks with expired status:",
      error.message
    );
    throw error;
  }
};
export const getCowRawMilkData = async () => {
  try {
    const response = await fetchAPI("raw_milks/raw_milk_data", "GET");
    return response;
  } catch (error) {
    console.error(
      "Failed to fetch all raw milks with expired status:",
      error.message
    );
    throw error;
  }
};

export const createRawMilk = (data) => fetchAPI("raw_milks", "POST", data);

export const updateRawMilk = (id, data) =>
  fetchAPI(`raw_milks/${id}`, "PUT", data);

export const deleteRawMilk = (id) => fetchAPI(`raw_milks/${id}`, "DELETE");

export const getFreshnessNotifications = async () => {
  try {
    const response = await fetchAPI("raw_milks/freshness_notifications", "GET");
    return response;
  } catch (error) {
    console.error("Failed to fetch freshness notifications:", error.message);
    throw error;
  }
};

export const exportFarmersPDF = async () => {
  try {
    const response = await fetch(
      "http://127.0.0.1:5000/api/raw_milks/biekenpedeedf"
    );
    console.log("PDF Export Response:", response);
    return response;
  } catch (error) {
    console.error("Error fetching PDF:", error);
    throw error;
  }
};

// EXPORT peternak ke Excel
export const exportFarmersExcel = () =>
  fetch("http://127.0.0.1:5000/api/raw_milks/exc");
