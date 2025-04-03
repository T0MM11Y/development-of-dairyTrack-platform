import { fetchAPI } from "../apiClient1";

export const getExpenses = () => fetchAPI("finance/expenses/");
export const getExpenseById = (id) => fetchAPI(`finance/expenses/${id}/`);
export const createExpense = (data) => fetchAPI("finance/expenses/", "POST", data);
export const updateExpense = (id, data) => fetchAPI(`finance/expenses/${id}/`, "PUT", data);
export const deleteExpense = (id) => fetchAPI(`finance/expenses/${id}/`, "DELETE");
