import { fetchAPI } from "../apiClient2";

// Mendapatkan semua notifikasi
export const getAllNotifications = () => fetchAPI("notifications/");

// Mendapatkan notifikasi yang belum dibaca
export const getUnreadNotifications = () => fetchAPI("notifications/unread");

// Mendapatkan notifikasi terkait stok pakan
export const getFeedStockNotifications = () => fetchAPI("notifications/feed-stock");

// Menandai notifikasi sebagai dibaca
export const markNotificationAsRead = (id) => fetchAPI(`notifications/${id}/read`, "PUT");

// Menandai semua notifikasi sebagai dibaca
export const markAllNotificationsAsRead = () => fetchAPI("notifications/read-all", "PUT");

// Menghapus notifikasi
export const deleteNotification = (id) => fetchAPI(`notifications/${id}`, "DELETE");

// Memeriksa level stok pakan dan membuat notifikasi jika diperlukan
export const checkFeedStockLevels = () => fetchAPI("notifications/check-feed-stock", "POST");