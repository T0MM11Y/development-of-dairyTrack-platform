import { fetchAPI } from "../apiClient2";

export const getAlldailyFeedItems = () => fetchAPI("dailyFeedItem/");
export const getdailyFeedItemById = (id) => fetchAPI(`dailyFeedItem/${id}/`);
export const createdailyFeedItem = (data) => fetchAPI("dailyFeedItem/", "POST", data);
export const updatedailyFeedItem = (id, data) => fetchAPI(`dailyFeedItem/${id}/`, "PUT", data);
export const deletedailyFeedItem = (id) => fetchAPI(`dailyFeedItem/${id}/`, "DELETE");
export const getFeedUsageByDate = () => fetchAPI(`dailyFeedItem/feedUsage/`);
