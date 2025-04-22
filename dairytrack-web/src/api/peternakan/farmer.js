import { fetchAPI } from "../apiClient";

// GET semua data peternak
export const getFarmers = async () => {
  const farmers = await fetchAPI("farmers");
  return farmers.sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  );
};
// GET satu peternak by ID
export const getFarmerById = (id) => fetchAPI(`farmers/${id}`);

// CREATE peternak baru
export const createFarmer = (data) => fetchAPI("farmers", "POST", data);

// UPDATE peternak
export const updateFarmer = (id, data) =>
  fetchAPI(`farmers/${id}`, "PUT", data);

// DELETE peternak
export const deleteFarmer = (id) => fetchAPI(`farmers/${id}`, "DELETE");

// EXPORT peternak ke PDF
export const exportFarmersPDF = async () => {
  try {
    const response = await fetch(
      "http://127.0.0.1:5000/api/farmers/biekenpedeedf"
    );
    console.log("PDF Export Response:", response);
    return response;
  } catch (error) {
    console.error("Error fetching PDF:", error);
    throw error;
  }
};

// EXPORT peternak ke Excel
export const exportFarmersExcel = () =>
  fetch("http://127.0.0.1:5000/api/farmers/export/exc");
