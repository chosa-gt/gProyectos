import api from "./axios";

export const getStats = () => api.get("/dashboard/stats");
export const getCharts = () => api.get("/dashboard/charts");
export const getMisTareas = () => api.get("/dashboard/mis-tareas");
