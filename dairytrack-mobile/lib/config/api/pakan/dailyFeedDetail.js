import { fetchAPI } from "../apiClient2";

export const getAllDailyFeedDetails = () => fetchAPI("dailyFeedComplete/");
export const getDailyFeedDetailById = (id) => fetchAPI(`dailyFeedComplete/${id}/`);
export const createDailyFeedDetail = (data) => fetchAPI("dailyFeedComplete/", "POST", data);
export const updateDailyFeedDetail = (id, data) => fetchAPI(`dailyFeedComplete/${id}/`, "PUT", data);
export const deleteDailyFeedDetail = (id) => fetchAPI(`dailyFeedComplete/${id}/`, "DELETE");
