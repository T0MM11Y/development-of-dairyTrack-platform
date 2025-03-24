const DIS_API = "http://127.0.0.1:8000/api/disease-history/";
export const getDiseaseHistory = async () => (await fetch(DIS_API)).json();
export const createDiseaseHistory = async (data) => (await fetch(DIS_API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) })).json();
export const deleteDiseaseHistory = async (id) => await fetch(`${DIS_API}${id}/`, { method: "DELETE" });