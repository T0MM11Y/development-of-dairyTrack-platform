import { fetchAPI } from "../apiClient2";

export const getFeeds = () => fetchAPI("feed/");
export const getFeedById = (id) => fetchAPI(`feed/${id}/`);
export const createFeed = (data) => fetchAPI("feed/", "POST", data);
export const updateFeed = (id, data) => fetchAPI(`feed/${id}/`, "PUT", data);
export const deleteFeed = (id) => fetchAPI(`feed/${id}/`, "DELETE");
