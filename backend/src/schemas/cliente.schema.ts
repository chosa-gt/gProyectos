import { z } from "zod";

export const createClienteSchema = z.object({
  nombre:            z.string().min(1, "El nombre es obligatorio").max(100),
  correo:            z.string().email("Correo electrónico inválido").max(100).optional(),
  telefono:          z.string().max(50).optional(),
  id_empresa:        z.number().int().positive("Empresa inválida"),
  id_estado_cliente: z.number().int().positive("Estado inválido"),
});

export const updateClienteSchema = createClienteSchema.partial();
