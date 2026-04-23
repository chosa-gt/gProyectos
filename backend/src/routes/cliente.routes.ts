import { Router } from "express";
import * as clienteController from "../controllers/cliente.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

// Catálogos
router.get("/empresas",       authMiddleware, clienteController.getEmpresas);
router.get("/estados-cliente", authMiddleware, clienteController.getEstadosCliente);

// CRUD
router.get("/",     authMiddleware, clienteController.getAll);
router.get("/:id",  authMiddleware, clienteController.getById);
router.post("/",    authMiddleware, clienteController.create);
router.put("/:id",  authMiddleware, clienteController.update);
router.delete("/:id", authMiddleware, clienteController.remove);

export default router;