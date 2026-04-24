import { Request, Response, NextFunction } from "express";
import * as tareaService from "../services/tarea.service.js";

export const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id_proyecto = req.query.id_proyecto ? Number(req.query.id_proyecto) : undefined;
    const tareas = await tareaService.getAll(id_proyecto);
    res.status(200).json({ status: "ok", data: tareas });
  } catch (err) {
    next(err);
  }
};

export const getById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tarea = await tareaService.getById(Number(req.params.id));
    res.status(200).json({ status: "ok", data: tarea });
  } catch (err) {
    next(err);
  }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tarea = await tareaService.create(req.body);
    res.status(201).json({ status: "ok", data: tarea });
  } catch (err) {
    next(err);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tarea = await tareaService.update(Number(req.params.id), req.body);
    res.status(200).json({ status: "ok", data: tarea });
  } catch (err) {
    next(err);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await tareaService.remove(Number(req.params.id));
    res.status(200).json({ status: "ok", data: result });
  } catch (err) {
    next(err);
  }
};

export const getPrioridades = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const prioridades = await tareaService.getPrioridades();
    res.status(200).json({ status: "ok", data: prioridades });
  } catch (err) {
    next(err);
  }
};

export const getEstadosTarea = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const estados = await tareaService.getEstadosTarea();
    res.status(200).json({ status: "ok", data: estados });
  } catch (err) {
    next(err);
  }
};