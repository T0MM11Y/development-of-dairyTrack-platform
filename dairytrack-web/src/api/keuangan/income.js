import { fetchAPI } from "../apiClient1";

export const getIncomes = () => fetchAPI("finance/incomes/");
export const getIncomeById = (id) => fetchAPI(`finance/incomes/${id}/`);
export const createIncome = (data) => fetchAPI("finance/incomes/", "POST", data);
export const updateIncome = (id, data) => fetchAPI(`finance/incomes/${id}/`, "PUT", data);
export const deleteIncome = (id) => fetchAPI(`finance/incomes/${id}/`, "DELETE");
