const COW_API = "http://127.0.0.1:8000/api/cows/";
export const getCows = async () => (await fetch(COW_API)).json();
export const createCow = async (data) => (await fetch(COW_API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) })).json();
export const updateCow = async (id, data) => (await fetch(`${COW_API}${id}/`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) })).json();
export const deleteCow = async (id) => await fetch(`${COW_API}${id}/`, { method: "DELETE" });