import api from "./axios";

export const login = (correo: string, contrasena: string) =>
  api.post("/auth/login", { correo, contrasena });

export const registro = (data: {
  nombre: string;
  apellido: string;
  correo: string;
  contrasena: string;
}) => api.post("/auth/register", data);

export const refreshTokenApi = (refreshToken: string) =>
  api.post("/auth/refresh", { refreshToken });
