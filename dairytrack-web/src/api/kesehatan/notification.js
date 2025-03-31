import { fetchAPI } from "../apiClient3";

export const getNotifications = () => fetchAPI("notifications");
