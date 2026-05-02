import api from "./axios";
import type { Usuario, PaginationMeta } from "../types";

export interface UsuariosResponse {
  data: Usuario[];
  meta: PaginationMeta;
}

export const getUsuariosApi = async (params?: {
  page?: number; limit?: number; search?: string;
}): Promise<UsuariosResponse> => {
  const { data } = await api.get("/usuarios", { params });
  return { data: data.data, meta: data.meta };
};

export const createUsuarioApi = async (payload: {
  nombre: string; apellido: string; correo: string;
  contrasena: string; id_rol: number;
}): Promise<Usuario> => {
  const { data } = await api.post("/usuarios", payload);
  return data.data;
};

export const updateUsuarioApi = async (
  id: number,
  payload: { nombre?: string; apellido?: string; correo?: string; contrasena?: string; id_rol?: number }
): Promise<Usuario> => {
  const { data } = await api.put(`/usuarios/${id}`, payload);
  return data.data;
};

export const desactivarUsuarioApi = async (id: number): Promise<void> => {
  await api.delete(`/usuarios/${id}`);
};

export const activarUsuarioApi = async (id: number): Promise<void> => {
  await api.patch(`/usuarios/${id}/activar`);
};
