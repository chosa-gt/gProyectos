import { z } from "zod";

const fechaISO = z.string().regex(
  /^\d{4}-\d{2}-\d{2}$/,
  "Formato de fecha inválido, use YYYY-MM-DD"
);

export const createProyectoSchema = z.object({
  nombre:             z.string().min(1, "El nombre es obligatorio").max(255),
  descripcion:        z.string().optional(),
  fecha_inicio:       fechaISO,
  fecha_fin:          fechaISO.optional(),
  id_cliente:         z.number().int().positive("Cliente inválido"),
  id_estado_proyecto: z.number().int().positive("Estado inválido"),
});

export const updateProyectoSchema = createProyectoSchema.partial().extend({
  detalle: z.string().max(500).optional(),
});
