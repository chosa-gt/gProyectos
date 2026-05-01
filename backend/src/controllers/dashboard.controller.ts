import { Request, Response, NextFunction } from "express";
import * as dashboardService from "../services/dashboard.service.js";

export const getStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await dashboardService.getStats();
    res.json({ status: "ok", data });
  } catch (err) {
    next(err);
  }
};
