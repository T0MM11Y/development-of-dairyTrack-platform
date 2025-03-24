const SYMPTOM_API = "http://127.0.0.1:8000/api/symptoms/";
export const getSymptoms = async () => (await fetch(SYMPTOM_API)).json();
export const createSymptom = async (data) => (await fetch(SYMPTOM_API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) })).json();
export const deleteSymptom = async (id) => await fetch(`${SYMPTOM_API}${id}/`, { method: "DELETE" });