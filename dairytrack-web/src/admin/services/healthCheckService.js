const HC_API = "http://127.0.0.1:8000/api/health-checks/";
export const getHealthChecks = async () => (await fetch(HC_API)).json();
export const createHealthCheck = async (data) => (await fetch(HC_API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) })).json();
export const deleteHealthCheck = async (id) => await fetch(`${HC_API}${id}/`, { method: "DELETE" });