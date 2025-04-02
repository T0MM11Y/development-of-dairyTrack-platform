import { fetchAPI } from "../apiClient2";

export const getDailyFeedDetails = () => fetchAPI("dailyFeedDetail/");
export const getDailyFeedDetailById = (id) => fetchAPI(`dailyFeedDetail/${id}/`);
export const createDailyFeedDetail = (data) => fetchAPI("dailyFeedDetail/", "POST", data);
export const updateDailyFeedDetail = (id, data) => fetchAPI(`dailyFeedDetail/${id}/`, "PUT", data);
export const deleteDailyFeedDetail = (id) => fetchAPI(`dailyFeedDetail/${id}/`, "DELETE");
