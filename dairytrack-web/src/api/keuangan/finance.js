import { fetchAPI } from "../apiClient1";

export const getFinances = () => fetchAPI("finance/finance/");
