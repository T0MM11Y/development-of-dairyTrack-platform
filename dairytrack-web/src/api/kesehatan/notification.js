import { fetchAPI } from "../apiClient";

export const getNotifications = () => fetchAPI("notifications");
