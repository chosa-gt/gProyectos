import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UnauthorizedError } from "../errors/AppError.js";

export interface JwtPayload {
  id_usuario: number;
  id_rol: number;
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer "))
    return next(new UnauthorizedError("Token no proporcionado"));

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    req.usuario = payload;
    next();
  } catch {
    next(new UnauthorizedError("Token inválido o expirado"));
  }
};