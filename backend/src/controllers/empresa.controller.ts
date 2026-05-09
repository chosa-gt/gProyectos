import { Request, Response, NextFunction } from "express";
import * as empresaService from "../services/empresa.service.js";

export const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const empresas = await empresaService.getAll();
    res.status(200).json({ status: "ok", data: empresas });
  } catch (err) {
    next(err);
  }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const empresa = await empresaService.create(req.body);
    res.status(201).json({ status: "ok", data: empresa });
  } catch (err) {
    next(err);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const empresa = await empresaService.update(Number(req.params.id), req.body);
    res.status(200).json({ status: "ok", data: empresa });
  } catch (err) {
    next(err);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await empresaService.remove(Number(req.params.id));
    res.status(200).json({ status: "ok", data: { message: "Empresa eliminada" } });
  } catch (err) {
    next(err);
  }
};
