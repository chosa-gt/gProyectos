import { Router } from "express";
import * as proyectoController from "../controllers/proyecto.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

// Catálogo
router.get("/estados-proyecto", authMiddleware, proyectoController.getEstadosProyecto);

// CRUD
router.get("/",     authMiddleware, proyectoController.getAll);
router.get("/:id",  authMiddleware, proyectoController.getById);
router.post("/",    authMiddleware, proyectoController.create);
router.put("/:id",  authMiddleware, proyectoController.update);
router.delete("/:id", authMiddleware, proyectoController.remove);

export default router;