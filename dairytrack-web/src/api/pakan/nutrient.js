import { fetchAPI } from "../apiClient2";

export const getNutritions = () => fetchAPI("nutrition/");
export const getNutritionById = (id) => fetchAPI(`nutrition/${id}/`);
export const createNutrition = (data) => fetchAPI("nutrition/", "POST", data);
export const updateNutrition = (id, data) => fetchAPI(`nutrition/${id}/`, "PUT", data);
export const deleteNutrition = (id) => fetchAPI(`nutrition/${id}/`, "DELETE");
