import { fetchAPI } from "../apiClient";

// GET semua data raw milk
export const getRawMilks = () => fetchAPI("raw_milks");

// GET satu raw milk by ID
export const getRawMilkById = (id) => fetchAPI(`raw_milks/${id}`);

// CREATE raw milk baru
export const createRawMilk = (data) => fetchAPI("raw_milks", "POST", data);

// UPDATE raw milk
export const updateRawMilk = (id, data) =>
  fetchAPI(`raw_milks/${id}`, "PUT", data);

// DELETE raw milk
export const deleteRawMilk = (id) => fetchAPI(`raw_milks/${id}`, "DELETE");
