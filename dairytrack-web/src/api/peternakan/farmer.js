import { fetchAPI } from "../apiClient";

// GET semua data peternak
export const getFarmers = () => fetchAPI("farmers");

// GET satu peternak by ID
export const getFarmerById = (id) => fetchAPI(`farmers/${id}`);

// CREATE peternak baru
export const createFarmer = (data) => fetchAPI("farmers", "POST", data);

// UPDATE peternak
export const updateFarmer = (id, data) =>
  fetchAPI(`farmers/${id}`, "PUT", data);

// DELETE peternak
export const deleteFarmer = (id) => fetchAPI(`farmers/${id}`, "DELETE");
