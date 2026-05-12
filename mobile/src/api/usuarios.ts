import api from "./axios";

export const getUsuarios = (page = 1) =>
  api.get("/usuarios", { params: { page } });

export const getUsuario = (id: number) => api.get(`/usuarios/${id}`);

export const crearUsuario = (data: object) => api.post("/usuarios", data);

export const actualizarUsuario = (id: number, data: object) =>
  api.put(`/usuarios/${id}`, data);

export const toggleActivo = (id: number, activo: boolean) =>
  activo
    ? api.delete(`/usuarios/${id}`)
    : api.patch(`/usuarios/${id}/activar`);
