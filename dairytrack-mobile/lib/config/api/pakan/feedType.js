import { fetchAPI } from "../apiClient2";

export const getFeedTypes = () => fetchAPI("feedType/");
export const getFeedTypeById = (id) => fetchAPI(`feedType/${id}/`);
export const createFeedType = (data) => fetchAPI("feedType/", "POST", data);
export const updateFeedType = (id, data) => fetchAPI(`feedType/${id}/`, "PUT", data);
export const deleteFeedType = (id) => fetchAPI(`feedType/${id}/`, "DELETE");
