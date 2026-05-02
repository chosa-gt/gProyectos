import { Router } from "express";
import * as tareaController from "../controllers/tarea.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createTareaSchema, updateTareaSchema } from "../schemas/tarea.schema.js";

const router = Router();

// Catálogos
router.get("/prioridades",   authMiddleware, tareaController.getPrioridades);
router.get("/estados-tarea", authMiddleware, tareaController.getEstadosTarea);

// CRUD
router.get("/",       authMiddleware, tareaController.getAll);
router.get("/:id",    authMiddleware, tareaController.getById);
router.post("/",      authMiddleware, validate(createTareaSchema), tareaController.create);
router.put("/:id",    authMiddleware, validate(updateTareaSchema), tareaController.update);
router.delete("/:id", authMiddleware, tareaController.remove);

export default router;
