import { Router } from "express";
import authRoutes from "./auth.routes.js";

export const router = Router();

router.use("/auth", authRoutes);