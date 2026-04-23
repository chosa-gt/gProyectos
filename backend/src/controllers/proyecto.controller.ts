import { Request, Response, NextFunction } from "express";
import * as proyectoService from "../services/proyecto.service.js";

export const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const proyectos = await proyectoService.getAll();
    res.status(200).json({ status: "ok", data: proyectos });
  } catch (err) {
    next(err);
  }
};

export const getById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const proyecto = await proyectoService.getById(Number(req.params.id));
    res.status(200).json({ status: "ok", data: proyecto });
  } catch (err) {
    next(err);
  }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const proyecto = await proyectoService.create(req.body);
    res.status(201).json({ status: "ok", data: proyecto });
  } catch (err) {
    next(err);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const proyecto = await proyectoService.update(Number(req.params.id), req.body);
    res.status(200).json({ status: "ok", data: proyecto });
  } catch (err) {
    next(err);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await proyectoService.remove(Number(req.params.id));
    res.status(200).json({ status: "ok", data: result });
  } catch (err) {
    next(err);
  }
};

export const getEstadosProyecto = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const estados = await proyectoService.getEstadosProyecto();
    res.status(200).json({ status: "ok", data: estados });
  } catch (err) {
    next(err);
  }
};