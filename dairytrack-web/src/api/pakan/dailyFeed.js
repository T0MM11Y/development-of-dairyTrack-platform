import { fetchAPI } from "../apiClient2";

export const getDailyFeeds = () => fetchAPI("dailyFeed/");
export const getdailyFeedById = (id) => fetchAPI(`dailyFeed/${id}/`);
export const createdailyFeed = (data) => fetchAPI("dailyFeed/", "POST", data);
export const updatedailyFeed = (id, data) => fetchAPI(`dailyFeed/${id}/`, "PUT", data);
export const deletedailyFeed = (id) => fetchAPI(`dailyFeed/${id}/`, "DELETE");
