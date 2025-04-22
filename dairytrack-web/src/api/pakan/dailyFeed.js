import { fetchAPI } from "../apiClient2";

export const getAllDailyFeeds = () => fetchAPI("dailyFeedComplete/");
export const getDailyFeedById = (id) => fetchAPI(`dailyFeedComplete/${id}/`);
export const createDailyFeed = (data) => fetchAPI("dailyFeedComplete/", "POST", data);
export const updateDailyFeed = (id, data) => fetchAPI(`dailyFeedComplete/${id}/`, "PUT", data);
export const deleteDailyFeed = (id) => fetchAPI(`dailyFeedComplete/${id}/`, "DELETE");
export const getNutrition = (id) => fetchAPI(`dailyFeedComplete/nutrisi/${id}/`, "DELETE");
