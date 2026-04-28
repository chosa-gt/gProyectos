import api from "./axios";

export const loginApi = async (correo: string, contrasena: string) => {
  const { data } = await api.post("/auth/login", { correo, contrasena });
  return data.data;
};

export const registerApi = async (payload: {
  nombre: string;
  apellido: string;
  correo: string;
  contrasena: string;
  id_rol: number;
}) => {
  const { data } = await api.post("/auth/register", payload);
  return data.data;
};

export const logoutApi = async (refreshToken: string) => {
  await api.post("/auth/logout", { refreshToken });
};