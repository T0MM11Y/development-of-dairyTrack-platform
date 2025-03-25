import { fetchAPI } from "../apiClient";

// GET semua data sapi
export const getFarmers = () => fetchAPI("farmers");

// GET satu sapi by ID
export const getFarmerById = (id) => fetchAPI(`farmers/${id}`);

// CREATE sapi baru
export const createFarmer = (data) => fetchAPI("farmers/", "POST", data);

// UPDATE sapi
export const updateFarmer = (id, data) =>
  fetchAPI(`farmers/${id}/`, "PUT", data);

// DELETE sapi
export const deleteFarmer = (id) => fetchAPI(`farmers/${id}/`, "DELETE");
