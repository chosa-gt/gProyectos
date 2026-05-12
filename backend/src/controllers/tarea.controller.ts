import { Request, Response, NextFunction } from "express";
import * as tareaService from "../services/tarea.service.js";

export const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 10, search, id_proyecto, id_usuario, id_prioridad, id_estado_tarea } = req.query;
    const result = await tareaService.getAll(Number(page), Number(limit), {
      search:          search          as string | undefined,
      id_proyecto:     id_proyecto     ? Number(id_proyecto)     : undefined,
      id_usuario:      id_usuario      ? Number(id_usuario)      : undefined,
      id_prioridad:    id_prioridad    ? Number(id_prioridad)    : undefined,
      id_estado_tarea: id_estado_tarea ? Number(id_estado_tarea) : undefined,
    });
    res.status(200).json({ status: "ok", ...result });
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