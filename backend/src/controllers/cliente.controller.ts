import { Request, Response, NextFunction } from "express";
import * as clienteService from "../services/cliente.service.js";

export const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const clientes = await clienteService.getAll();
    res.status(200).json({ status: "ok", data: clientes });
  } catch (err) {
    next(err);
  }
};

export const getById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cliente = await clienteService.getById(Number(req.params.id));
    res.status(200).json({ status: "ok", data: cliente });
  } catch (err) {
    next(err);
  }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cliente = await clienteService.create(req.body);
    res.status(201).json({ status: "ok", data: cliente });
  } catch (err) {
    next(err);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cliente = await clienteService.update(Number(req.params.id), req.body);
    res.status(200).json({ status: "ok", data: cliente });
  } catch (err) {
    next(err);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await clienteService.remove(Number(req.params.id));
    res.status(200).json({ status: "ok", data: result });
  } catch (err) {
    next(err);
  }
};

export const getEmpresas = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const empresas = await clienteService.getEmpresas();
    res.status(200).json({ status: "ok", data: empresas });
  } catch (err) {
    next(err);
  }
};

export const getEstadosCliente = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const estados = await clienteService.getEstadosCliente();
    res.status(200).json({ status: "ok", data: estados });
  } catch (err) {
    next(err);
  }
};