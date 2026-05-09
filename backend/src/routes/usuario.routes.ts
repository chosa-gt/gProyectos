import { Router } from "express";
import * as usuarioController from "../controllers/usuario.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { roleMiddleware } from "../middlewares/role.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createUsuarioSchema, updateUsuarioSchema } from "../schemas/usuario.schema.js";

const router = Router();

// Lectura: cualquier usuario autenticado (necesario para asignar responsables en tareas)
router.get("/",               authMiddleware, usuarioController.getAll);
router.get("/:id",            authMiddleware, usuarioController.getById);

// Escritura: solo Admin
router.post("/",              authMiddleware, roleMiddleware(1), validate(createUsuarioSchema), usuarioController.create);
router.put("/:id",            authMiddleware, roleMiddleware(1), validate(updateUsuarioSchema), usuarioController.update);
router.delete("/:id",         authMiddleware, roleMiddleware(1), usuarioController.desactivar);
router.patch("/:id/activar",  authMiddleware, roleMiddleware(1), usuarioController.activar);

export default router;
