import { fetchAPI } from "../apiClient3";

export const getDiseaseHistories = () => fetchAPI("disease-history/");
export const getDiseaseHistoryById = (id) => fetchAPI(`disease-history/${id}/`);
export const createDiseaseHistory = (data) => fetchAPI("disease-history/", "POST", data);
export const updateDiseaseHistory = (id, data) => fetchAPI(`disease-history/${id}/`, "PUT", data);
export const deleteDiseaseHistory = (id) => fetchAPI(`disease-history/${id}/`, "DELETE");
