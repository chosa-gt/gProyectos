import api from "./axios";

export const getClientes = (page = 1, search = "") =>
  api.get("/clientes", { params: { page, search } });

export const getCliente = (id: number) => api.get(`/clientes/${id}`);

export const crearCliente = (data: object) => api.post("/clientes", data);

export const actualizarCliente = (id: number, data: object) =>
  api.put(`/clientes/${id}`, data);

export const eliminarCliente = (id: number) => api.delete(`/clientes/${id}`);

export const getEmpresas = () => api.get("/clientes/empresas");

export const crearEmpresa = (data: { nombre: string }) => api.post("/empresas", data);

export const getEstadosCliente = () => api.get("/clientes/estados-cliente");
