import { fetchAPI } from "../apiClient";

export const getAllNotifications = () => fetchAPI("notifications");
