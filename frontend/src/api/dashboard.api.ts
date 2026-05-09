import api from "./axios";

export interface DashboardStats {
  totalClientes:  number;
  totalProyectos: number;
  totalTareas:    number;
  totalUsuarios:  number;
}

export interface MiTarea {
  id_tarea:     number;
  tarea:        string;
  fecha_fin:    string | null;
  proyecto:     { nombre: string };
  prioridad:    { nombre_prioridad: string };
  estado_tarea: { estado: string };
}

export interface ChartData {
  proyectosPorEstado:    { estado: string;    total: number }[];
  tareasPorEstado:       { estado: string;    total: number }[];
  tareasPorPrioridad:    { prioridad: string; total: number }[];
  misTareasPorEstado:    { estado: string;    total: number }[];
  misTareasPorPrioridad: { prioridad: string; total: number }[];
}

export const getStatsApi = async (): Promise<DashboardStats> => {
  const { data } = await api.get("/dashboard/stats");
  return data.data;
};

export const getMisTareasApi = async (): Promise<MiTarea[]> => {
  const { data } = await api.get("/dashboard/mis-tareas");
  return data.data;
};

export const getChartsApi = async (): Promise<ChartData> => {
  const { data } = await api.get("/dashboard/charts");
  return data.data;
};
