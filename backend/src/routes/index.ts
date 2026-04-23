import { Router } from "express";
import authRoutes from "./auth.routes.js";
import usuarioRoutes from "./usuario.routes.js";
import clienteRoutes from "./cliente.routes.js";

export const router = Router();

router.use("/auth",     authRoutes);
router.use("/usuarios", usuarioRoutes);
router.use("/clientes", clienteRoutes);