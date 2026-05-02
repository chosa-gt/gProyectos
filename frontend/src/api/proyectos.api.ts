import api from "./axios";
import type { Proyecto, EstadoProyecto, PaginationMeta } from "../types";

export interface ProyectosResponse {
  data: Proyecto[];
  meta: PaginationMeta;
}

export const getProyectosApi = async (params?: {
  page?: number; limit?: number; search?: string;
  id_cliente?: number; id_estado_proyecto?: number;
}): Promise<ProyectosResponse> => {
  const { data } = await api.get("/proyectos", { params });
  return { data: data.data, meta: data.meta };
};

export const getProyectoByIdApi = async (id: number): Promise<Proyecto> => {
  const { data } = await api.get(`/proyectos/${id}`);
  return data.data;
};

export const getEstadosProyectoApi = async (): Promise<EstadoProyecto[]> => {
  const { data } = await api.get("/proyectos/estados-proyecto");
  return data.data;
};

export const createProyectoApi = async (payload: {
  nombre: string; descripcion?: string; fecha_inicio: string;
  fecha_fin?: string; id_cliente: number; id_estado_proyecto: number;
}): Promise<Proyecto> => {
  const { data } = await api.post("/proyectos", payload);
  return data.data;
};

export const updateProyectoApi = async (
  id: number,
  payload: { nombre?: string; descripcion?: string; fecha_inicio?: string; fecha_fin?: string; id_cliente?: number; id_estado_proyecto?: number }
): Promise<Proyecto> => {
  const { data } = await api.put(`/proyectos/${id}`, payload);
  return data.data;
};

export const deleteProyectoApi = async (id: number): Promise<void> => {
  await api.delete(`/proyectos/${id}`);
};
