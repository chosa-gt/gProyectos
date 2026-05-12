import api from "./axios";

export const getProyectos = (page = 1, search = "") =>
  api.get("/proyectos", { params: { page, search } });

export const getProyecto = (id: number) => api.get(`/proyectos/${id}`);

export const crearProyecto = (data: object) => api.post("/proyectos", data);

export const actualizarProyecto = (id: number, data: object) =>
  api.put(`/proyectos/${id}`, data);

export const eliminarProyecto = (id: number) => api.delete(`/proyectos/${id}`);

export const cambiarEstadoProyecto = (
  id: number,
  data: { id_estado_proyecto: number; detalle: string }
) => api.put(`/proyectos/${id}`, data);

export const getHistorialProyecto = (id: number) =>
  api.get(`/proyectos/${id}/historial`);

export const getEstadosProyecto = () => api.get("/proyectos/estados-proyecto");

export const getClientesParaProyecto = (page = 1) =>
  api.get("/clientes", { params: { page, limit: 100 } });
