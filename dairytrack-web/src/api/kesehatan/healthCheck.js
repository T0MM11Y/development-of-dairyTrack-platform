import { fetchAPI } from "../apiClient3";

export const getHealthChecks = () => fetchAPI("health-checks/");
export const getHealthCheckById = (id) => fetchAPI(`health-checks/${id}/`);
export const createHealthCheck = (data) => fetchAPI("health-checks/", "POST", data);
export const updateHealthCheck = (id, data) => fetchAPI(`health-checks/${id}/`, "PUT", data);
export const deleteHealthCheck = (id) => fetchAPI(`health-checks/${id}/`, "DELETE");
