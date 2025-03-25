import { fetchAPI } from "../apiClient";

export const getSymptoms = () => fetchAPI("symptoms/");
export const getSymptomById = (id) => fetchAPI(`symptoms/${id}/`);
export const createSymptom = (data) => fetchAPI("symptoms/", "POST", data);
export const updateSymptom = (id, data) => fetchAPI(`symptoms/${id}/`, "PUT", data);
export const deleteSymptom = (id) => fetchAPI(`symptoms/${id}/`, "DELETE");
