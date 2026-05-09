import { z } from "zod";

export const createEmpresaSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio").max(100),
});

export const updateEmpresaSchema = createEmpresaSchema.partial();
