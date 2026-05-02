import { z } from "zod";

export const registerSchema = z.object({
  nombre:     z.string().min(1, "El nombre es obligatorio").max(50),
  apellido:   z.string().min(1, "El apellido es obligatorio").max(50),
  correo:     z.string().email("Correo electrónico inválido").max(100),
  contrasena: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export const loginSchema = z.object({
  correo:     z.string().email("Correo electrónico inválido"),
  contrasena: z.string().min(1, "La contraseña es obligatoria"),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, "El refresh token es obligatorio"),
});

export const logoutSchema = z.object({
  refreshToken: z.string().min(1, "El refresh token es obligatorio"),
});
