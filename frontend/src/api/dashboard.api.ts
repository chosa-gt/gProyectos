import api from "./axios";

export interface DashboardStats {
  totalClientes: number;
  totalProyectos: number;
  totalTareas: number;
  totalUsuarios: number;
}

export interface MiTarea {
  id_tarea:    number;
  tarea:       string;
  fecha_fin:   string | null;
  proyecto:    { nombre: string };
  prioridad:   { nombre_prioridad: string };
  estado_tarea:{ estado: string };
}

export const getStatsApi = async (): Promise<DashboardStats> => {
  const { data } = await api.get("/dashboard/stats");
  return data.data;
};

export const getMisTareasApi = async (): Promise<MiTarea[]> => {
  const { data } = await api.get("/dashboard/mis-tareas");
  return data.data;
};
