import api from "./axios";
import { registerApi } from "./auth.api";
import type { Usuario } from "../types";

export const getUsuariosApi = async (): Promise<Usuario[]> => {
  const { data } = await api.get("/usuarios");
  return data.data;
};

export const createUsuarioApi = (payload: {
  nombre: string;
  apellido: string;
  correo: string;
  contrasena: string;
  id_rol: number;
}) => registerApi(payload);

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
