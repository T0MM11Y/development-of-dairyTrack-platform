import { fetchAPI } from "../apiClient2";

export const getAllDailyFeeds = () => fetchAPI("dailyFeedSchedule/");
export const getDailyFeedById = (id) => fetchAPI(`dailyFeedSchedule/${id}/`);
export const createDailyFeed = (data) => fetchAPI("dailyFeedSchedule/", "POST", data);
export const updateDailyFeed = (id, data) => fetchAPI(`dailyFeedSchedule/${id}/`, "PUT", data);
export const deleteDailyFeed = (id) => fetchAPI(`dailyFeedSchedule/${id}/`, "DELETE");
export const getNutrition = (id) => fetchAPI(`dailyFeedSchedule/nutrisi/${id}/`, "DELETE");
