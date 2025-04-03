import { fetchAPI } from "../apiClient1";

export const getSalesTransactions = () => fetchAPI("finance/sales-transactions/");
export const getSalesTransactionById = (id) => fetchAPI(`finance/sales-transactions/${id}/`);
export const createSalesTransaction = (data) => fetchAPI("finance/sales-transactions/", "POST", data);
export const updateSalesTransaction = (id, data) => fetchAPI(`finance/sales-transactions/${id}/`, "PUT", data);
export const deleteSalesTransaction = (id) => fetchAPI(`finance/sales-transactions/${id}/`, "DELETE");
