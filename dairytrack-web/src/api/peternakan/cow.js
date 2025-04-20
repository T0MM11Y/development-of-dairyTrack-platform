import { fetchAPI } from "../apiClient";

// GET semua data sapi
export const getCows = () => fetchAPI("cows");

export const getCowsFeMale = () => fetchAPI("cows/female");

// GET satu sapi by ID
export const getCowById = (id) => fetchAPI(`cows/${id}`);

// CREATE sapi baru (HAPUS `/` setelah "cows")
export const createCow = (data) => fetchAPI("cows", "POST", data);

// UPDATE sapi (HAPUS `/` setelah ID)
export const updateCow = (id, data) => fetchAPI(`cows/${id}`, "PUT", data);

// DELETE sapi (HAPUS `/` setelah ID)
export const deleteCow = (id) => fetchAPI(`cows/${id}`, "DELETE");

// EXPORT sapi ke PDF
export const exportCowsPDF = async () => {
  try {
    const response = await fetch(
      "http://127.0.0.1:5000/api/cows/biekenpedeedf"
    );
    console.log("PDF Export Response:", response);
    return response;
  } catch (error) {
    console.error("Error fetching PDF:", error);
    throw error;
  }
};

// EXPORT sapi ke Excel
export const exportCowsExcel = () =>
  fetch("http://127.0.0.1:5000/api/cows/exc");
