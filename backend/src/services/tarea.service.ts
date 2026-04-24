import prisma from "../prisma/client.js";
import { NotFoundError } from "../errors/AppError.js";

export const getAll = async (id_proyecto?: number) => {
  return await prisma.tarea.findMany({
    where: id_proyecto ? { id_proyecto } : undefined,
    include: {
      usuario: { select: { nombre: true, apellido: true } },
      prioridad: { select: { nombre_prioridad: true } },
      estado_tarea: { select: { estado: true } },
      proyecto: { select: { nombre: true } },
    },
  });
};

export const getById = async (id: number) => {
  const tarea = await prisma.tarea.findUnique({
    where: { id_tarea: id },
    include: {
      usuario: { select: { nombre: true, apellido: true } },
      prioridad: { select: { nombre_prioridad: true } },
      estado_tarea: { select: { estado: true } },
      proyecto: { select: { nombre: true } },
    },
  });
  if (!tarea) throw new NotFoundError("Tarea no encontrada");
  return tarea;
};

export const create = async (data: {
  tarea: string;
  descripcion?: string;
  fecha_inicio: string;
  fecha_fin?: string;
  id_proyecto: number;
  id_usuario: number;
  id_prioridad: number;
  id_estado_tarea: number;
}) => {
  return await prisma.tarea.create({
    data: {
      ...data,
      fecha_inicio: new Date(data.fecha_inicio),
      fecha_fin: data.fecha_fin ? new Date(data.fecha_fin) : undefined,
    },
  });
};

export const update = async (
  id: number,
  data: {
    tarea?: string;
    descripcion?: string;
    fecha_inicio?: string;
    fecha_fin?: string;
    id_proyecto?: number;
    id_usuario?: number;
    id_prioridad?: number;
    id_estado_tarea?: number;
  }
) => {
  const existe = await prisma.tarea.findUnique({ where: { id_tarea: id } });
  if (!existe) throw new NotFoundError("Tarea no encontrada");

  return await prisma.tarea.update({
    where: { id_tarea: id },
    data: {
      ...data,
      fecha_inicio: data.fecha_inicio ? new Date(data.fecha_inicio) : undefined,
      fecha_fin: data.fecha_fin ? new Date(data.fecha_fin) : undefined,
    },
  });
};

export const remove = async (id: number) => {
  const existe = await prisma.tarea.findUnique({ where: { id_tarea: id } });
  if (!existe) throw new NotFoundError("Tarea no encontrada");

  await prisma.tarea.delete({ where: { id_tarea: id } });
  return { message: "Tarea eliminada correctamente" };
};

// Catálogos
export const getPrioridades = async () => {
  return await prisma.prioridad.findMany();
};

export const getEstadosTarea = async () => {
  return await prisma.estadoTarea.findMany();
};