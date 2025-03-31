import { fetchAPI } from "../apiClient";

// GET semua data supervisor
export const getSupervisors = () => fetchAPI("supervisors");

// GET satu supervisor by ID
export const getSupervisorById = (id) => fetchAPI(`supervisors/${id}`);

// CREATE supervisor baru
export const createSupervisor = (data) => fetchAPI("supervisors", "POST", data);

// UPDATE supervisor
export const updateSupervisor = (id, data) =>
  fetchAPI(`supervisors/${id}`, "PUT", data);

// DELETE supervisor
export const deleteSupervisor = (id) => fetchAPI(`supervisors/${id}`, "DELETE");
