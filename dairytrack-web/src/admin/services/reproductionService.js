const REP_API = "http://127.0.0.1:8000/api/reproduction/";
export const getReproduction = async () => (await fetch(REP_API)).json();
export const createReproduction = async (data) => (await fetch(REP_API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) })).json();
export const deleteReproduction = async (id) => await fetch(`${REP_API}${id}/`, { method: "DELETE" });