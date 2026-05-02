import api from "./axios";
import type { Tarea, Prioridad, EstadoTarea, PaginationMeta } from "../types";

export interface TareasResponse {
  data: Tarea[];
  meta: PaginationMeta;
}

export const getTareasApi = async (params?: {
  page?: number; limit?: number; search?: string;
  id_proyecto?: number; id_prioridad?: number; id_estado_tarea?: number;
}): Promise<TareasResponse> => {
  const { data } = await api.get("/tareas", { params });
  return { data: data.data, meta: data.meta };
};

export const getPrioridadesApi = async (): Promise<Prioridad[]> => {
  const { data } = await api.get("/tareas/prioridades");
  return data.data;
};

export const getEstadosTareaApi = async (): Promise<EstadoTarea[]> => {
  const { data } = await api.get("/tareas/estados-tarea");
  return data.data;
};

export const createTareaApi = async (payload: {
  tarea: string; descripcion?: string; fecha_inicio: string; fecha_fin?: string;
  id_proyecto: number; id_usuario: number; id_prioridad: number; id_estado_tarea: number;
}): Promise<Tarea> => {
  const { data } = await api.post("/tareas", payload);
  return data.data;
};

export const updateTareaApi = async (
  id: number,
  payload: { tarea?: string; descripcion?: string; fecha_inicio?: string; fecha_fin?: string; id_proyecto?: number; id_usuario?: number; id_prioridad?: number; id_estado_tarea?: number }
): Promise<Tarea> => {
  const { data } = await api.put(`/tareas/${id}`, payload);
  return data.data;
};

export const deleteTareaApi = async (id: number): Promise<void> => {
  await api.delete(`/tareas/${id}`);
};
