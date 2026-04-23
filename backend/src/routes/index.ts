import { Router } from "express";
import authRoutes from "./auth.routes.js";
import usuarioRoutes from "./usuario.routes.js";

export const router = Router();

router.use("/auth",     authRoutes);
router.use("/usuarios", usuarioRoutes);