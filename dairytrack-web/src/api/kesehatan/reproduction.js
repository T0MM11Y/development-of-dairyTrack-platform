import { fetchAPI } from "../apiClient";

export const getReproductions = () => fetchAPI("reproduction/");
export const getReproductionById = (id) => fetchAPI(`reproduction/${id}/`);
export const createReproduction = (data) => fetchAPI("reproduction/", "POST", data);
export const updateReproduction = (id, data) => fetchAPI(`reproduction/${id}/`, "PUT", data);
export const deleteReproduction = (id) => fetchAPI(`reproduction/${id}/`, "DELETE");
