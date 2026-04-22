import { Request, Response, NextFunction } from "express";
import { ForbiddenError } from "../errors/AppError.js";

export const roleMiddleware = (...rolesPermitidos: number[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    if (!req.usuario || !rolesPermitidos.includes(req.usuario.id_rol))
      return next(new ForbiddenError("No tienes permisos para esta acción"));
    next();
  };