import { z } from "zod";

export const createUsuarioSchema = z.object({
  nombre:     z.string().min(1, "El nombre es obligatorio").max(50),
  apellido:   z.string().min(1, "El apellido es obligatorio").max(50),
  correo:     z.string().email("Correo electrónico inválido").max(100),
  contrasena: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  id_rol:     z.number().int().min(1).max(2),
});

export const updateUsuarioSchema = z.object({
  nombre:     z.string().min(1).max(50).optional(),
  apellido:   z.string().min(1).max(50).optional(),
  correo:     z.string().email("Correo electrónico inválido").max(100).optional(),
  contrasena: z.string().min(6, "La contraseña debe tener al menos 6 caracteres").optional(),
  id_rol:     z.number().int().min(1).max(2).optional(),
});
