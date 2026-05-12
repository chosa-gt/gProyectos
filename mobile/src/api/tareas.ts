import api from "./axios";

export const getTareas = (page = 1, search = "", filters: { id_usuario?: number; id_proyecto?: number; limit?: number } = {}) =>
  api.get("/tareas", { params: { page, search, ...filters } });

export const getTarea = (id: number) => api.get(`/tareas/${id}`);

export const crearTarea = (data: object) => api.post("/tareas", data);

export const actualizarTarea = (id: number, data: object) =>
  api.put(`/tareas/${id}`, data);

export const eliminarTarea = (id: number) => api.delete(`/tareas/${id}`);

export const getPrioridades = () => api.get("/tareas/prioridades");

export const getEstadosTarea = () => api.get("/tareas/estados-tarea");
