import { fetchAPI } from "../apiClient2";

export const getDailyFeedSession = () => fetchAPI("dailyFeedSessions/");
export const getdailyFeedSessionsById = (id) => fetchAPI(`dailyFeedSessions/${id}/`);
export const createdailyFeedSessions = (data) => fetchAPI("dailyFeedSessions/", "POST", data);
export const updatedailyFeedSessions = (id, data) => fetchAPI(`dailyFeedSessions/${id}/`, "PUT", data);
export const deleteDailyFeedSession = (id) => fetchAPI(`dailyFeedSessions/${id}/`, "DELETE");
