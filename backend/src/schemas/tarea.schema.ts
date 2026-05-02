import { z } from "zod";

const fechaISO = z.string().regex(
  /^\d{4}-\d{2}-\d{2}$/,
  "Formato de fecha inválido, use YYYY-MM-DD"
);

export const createTareaSchema = z.object({
  tarea:           z.string().min(1, "El nombre de la tarea es obligatorio").max(255),
  descripcion:     z.string().optional(),
  fecha_inicio:    fechaISO,
  fecha_fin:       fechaISO.optional(),
  id_proyecto:     z.number().int().positive("Proyecto inválido"),
  id_usuario:      z.number().int().positive("Usuario inválido"),
  id_prioridad:    z.number().int().positive("Prioridad inválida"),
  id_estado_tarea: z.number().int().positive("Estado inválido"),
});

export const updateTareaSchema = createTareaSchema.partial();
