import { Request, Response, NextFunction } from "express";
import * as usuarioService from "../services/usuario.service.js";

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const usuario = await usuarioService.create(req.body);
    res.status(201).json({ status: "ok", data: usuario });
  } catch (err) {
    next(err);
  }
};

export const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const result = await usuarioService.getAll(Number(page), Number(limit), search as string | undefined);
    res.status(200).json({ status: "ok", ...result });
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

export const activar = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const usuario = await usuarioService.activar(Number(req.params.id));
    res.status(200).json({ status: "ok", data: usuario });
  } catch (err) {
    next(err);
  }
};