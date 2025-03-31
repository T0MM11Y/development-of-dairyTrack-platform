import { fetchAPI } from "../apiClient";

const BASE_URL = "feedStock";

export const getFeedStock = () => fetchAPI(`${BASE_URL}`);
export const getFeedStockById = (id) => fetchAPI(`${BASE_URL}/${id}`);
export const AddFeedStock = (data) => fetchAPI(`${BASE_URL}/add`, "POST", data);
export const updateFeedStock = (id, data) => fetchAPI(`${BASE_URL}/${id}`, "PUT", data);
