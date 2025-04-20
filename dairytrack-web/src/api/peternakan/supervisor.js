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

// EXPORT supervisor ke PDF
export const exportSupervisorsPDF = async () => {
  try {
    const response = await fetch(
      "http://127.0.0.1:5000/api/supervisors/biekenpedeedf"
    );
    console.log("PDF Export Response:", response);
    return response;
  } catch (error) {
    console.error("Error fetching PDF:", error);
    throw error;
  }
};

// EXPORT supervisor ke Excel
export const exportSupervisorsExcel = () =>
  fetch("http://127.0.0.1:5000/api/supervisors/exc");
