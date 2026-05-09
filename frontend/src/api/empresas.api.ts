import api from "./axios";
import type { Empresa } from "../types";

export interface EmpresaConConteo extends Empresa {
  _count: { clientes: number };
}

export const getEmpresasApi = async (): Promise<EmpresaConConteo[]> => {
  const { data } = await api.get("/empresas");
  return data.data;
};

export const createEmpresaApi = async (payload: { nombre: string }): Promise<Empresa> => {
  const { data } = await api.post("/empresas", payload);
  return data.data;
};

export const updateEmpresaApi = async (id: number, payload: { nombre: string }): Promise<Empresa> => {
  const { data } = await api.put(`/empresas/${id}`, payload);
  return data.data;
};

export const deleteEmpresaApi = async (id: number): Promise<void> => {
  await api.delete(`/empresas/${id}`);
};
