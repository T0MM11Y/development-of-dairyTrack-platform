import { fetchAPI } from "../apiClient";

// GET semua data sapi
export const getCows = () => fetchAPI("cows");

// GET satu sapi by ID
export const getCowById = (id) => fetchAPI(`cows/${id}`);

// CREATE sapi baru
export const createCow = (data) => fetchAPI("cows/", "POST", data);

// UPDATE sapi
export const updateCow = (id, data) => fetchAPI(`cows/${id}/`, "PUT", data);

// DELETE sapi
export const deleteCow = (id) => fetchAPI(`cows/${id}/`, "DELETE");
