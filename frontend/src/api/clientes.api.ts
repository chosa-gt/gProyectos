import api from "./axios";
import type { Cliente, Empresa, EstadoCliente } from "../types";

export const getClientesApi = async (): Promise<Cliente[]> => {
  const { data } = await api.get("/clientes");
  return data.data;
};

export const getEmpresasApi = async (): Promise<Empresa[]> => {
  const { data } = await api.get("/clientes/empresas");
  return data.data;
};

export const getEstadosClienteApi = async (): Promise<EstadoCliente[]> => {
  const { data } = await api.get("/clientes/estados-cliente");
  return data.data;
};

export const createClienteApi = async (payload: {
  nombre: string;
  correo?: string;
  telefono?: string;
  id_empresa: number;
  id_estado_cliente: number;
}): Promise<Cliente> => {
  const { data } = await api.post("/clientes", payload);
  return data.data;
};

export const updateClienteApi = async (
  id: number,
  payload: {
    nombre?: string;
    correo?: string;
    telefono?: string;
    id_empresa?: number;
    id_estado_cliente?: number;
  }
): Promise<Cliente> => {
  const { data } = await api.put(`/clientes/${id}`, payload);
  return data.data;
};

export const deleteClienteApi = async (id: number): Promise<void> => {
  await api.delete(`/clientes/${id}`);
};
