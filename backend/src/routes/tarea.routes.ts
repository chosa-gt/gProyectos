import { Router } from "express";
import * as tareaController from "../controllers/tarea.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

// Catálogos
router.get("/prioridades",   authMiddleware, tareaController.getPrioridades);
router.get("/estados-tarea", authMiddleware, tareaController.getEstadosTarea);

// CRUD
router.get("/",     authMiddleware, tareaController.getAll);
router.get("/:id",  authMiddleware, tareaController.getById);
router.post("/",    authMiddleware, tareaController.create);
router.put("/:id",  authMiddleware, tareaController.update);
router.delete("/:id", authMiddleware, tareaController.remove);

export default router;