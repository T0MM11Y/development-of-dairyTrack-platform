import { fetchAPI } from "../apiClient3";

export const getAllNotifications = () => fetchAPI("notifications");
