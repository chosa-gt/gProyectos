import { Router } from "express";
import * as usuarioController from "../controllers/usuario.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { roleMiddleware } from "../middlewares/role.middleware.js";

const router = Router();

// Solo Admin
router.get("/",     authMiddleware, roleMiddleware(1), usuarioController.getAll);
router.get("/:id",  authMiddleware, roleMiddleware(1), usuarioController.getById);
router.put("/:id",  authMiddleware, roleMiddleware(1), usuarioController.update);
router.delete("/:id",         authMiddleware, roleMiddleware(1), usuarioController.desactivar);
router.patch("/:id/activar",  authMiddleware, roleMiddleware(1), usuarioController.activar);

export default router;