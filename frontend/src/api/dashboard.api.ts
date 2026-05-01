import api from "./axios";

export interface DashboardStats {
  totalClientes: number;
  totalProyectos: number;
  totalTareas: number;
  totalUsuarios: number;
}

export const getStatsApi = async (): Promise<DashboardStats> => {
  const { data } = await api.get("/dashboard/stats");
  return data.data;
};
