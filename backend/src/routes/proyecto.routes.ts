import { Router } from "express";
import * as proyectoController from "../controllers/proyecto.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createProyectoSchema, updateProyectoSchema } from "../schemas/proyecto.schema.js";

const router = Router();

// Catálogo
router.get("/estados-proyecto", authMiddleware, proyectoController.getEstadosProyecto);

// CRUD
router.get("/",                authMiddleware, proyectoController.getAll);
router.get("/:id",             authMiddleware, proyectoController.getById);
router.get("/:id/historial",   authMiddleware, proyectoController.getHistorial);
router.post("/",               authMiddleware, validate(createProyectoSchema), proyectoController.create);
router.put("/:id",             authMiddleware, validate(updateProyectoSchema), proyectoController.update);
router.delete("/:id",          authMiddleware, proyectoController.remove);

export default router;
