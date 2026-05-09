import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import * as dashboardController from "../controllers/dashboard.controller.js";

const router = Router();

router.get("/stats",      authMiddleware, dashboardController.getStats);
router.get("/mis-tareas", authMiddleware, dashboardController.getMisTareas);

export default router;
