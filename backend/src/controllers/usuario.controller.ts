import { Request, Response, NextFunction } from "express";
import * as usuarioService from "../services/usuario.service.js";

export const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const usuarios = await usuarioService.getAll();
    res.status(200).json({ status: "ok", data: usuarios });
  } catch (err) {
    next(err);
  }
};

export const getById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const usuario = await usuarioService.getById(Number(req.params.id));
    res.status(200).json({ status: "ok", data: usuario });
  } catch (err) {
    next(err);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const usuario = await usuarioService.update(Number(req.params.id), req.body);
    res.status(200).json({ status: "ok", data: usuario });
  } catch (err) {
    next(err);
  }
};

export const desactivar = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const usuario = await usuarioService.desactivar(Number(req.params.id));
    res.status(200).json({ status: "ok", data: usuario });
  } catch (err) {
    next(err);
  }
};