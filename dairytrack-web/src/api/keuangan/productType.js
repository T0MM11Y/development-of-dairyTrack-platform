import { fetchAPI } from "../apiClient1";

export const getProductType = () => fetchAPI("dailyFeed/");
export const getProductTypeById = (id) => fetchAPI(`dailyFeed/${id}/`);
export const createProductType = (data) => fetchAPI("dailyFeed/", "POST", data);
export const updateProductType = (id, data) => fetchAPI(`dailyFeed/${id}/`, "PUT", data);
export const deleteProductType = (id) => fetchAPI(`dailyFeed/${id}/`, "DELETE");
