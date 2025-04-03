import { fetchAPI } from "../apiClient1";

export const getOrders = () => fetchAPI("sales/orders/");
export const getOrderById = (id) => fetchAPI(`sales/orders/${id}/`);
export const createOrder = (data) => fetchAPI("sales/orders/", "POST", data);
export const updateOrder = (id, data) => fetchAPI(`sales/orders/${id}/`, "PUT", data);
export const deleteOrder = (id) => fetchAPI(`sales/orders/${id}/`, "DELETE");
