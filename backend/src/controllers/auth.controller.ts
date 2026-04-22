import { Request, Response, NextFunction } from "express";
import * as authService from "../services/auth.service.js";

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { nombre, apellido, correo, contrasena, id_rol } = req.body;
    const usuario = await authService.register(nombre, apellido, correo, contrasena, id_rol);
    res.status(201).json({ status: "ok", data: usuario });
  } catch (err) {
    next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { correo, contrasena } = req.body;
    const result = await authService.login(correo, contrasena);
    res.status(200).json({ status: "ok", data: result });
  } catch (err) {
    next(err);
  }
};

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;
    const result = await authService.refresh(refreshToken);
    res.status(200).json({ status: "ok", data: result });
  } catch (err) {
    next(err);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;
    await authService.logout(refreshToken);
    res.status(200).json({ status: "ok", message: "Sesión cerrada" });
  } catch (err) {
    next(err);
  }
};