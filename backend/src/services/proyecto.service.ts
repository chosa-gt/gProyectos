import prisma from "../prisma/client.js";
import { NotFoundError } from "../errors/AppError.js";

export const getAll = async () => {
  return await prisma.proyecto.findMany({
    include: {
      cliente: { select: { nombre: true } },
      estado_proyecto: { select: { estado: true } },
    },
  });
};

export const getById = async (id: number) => {
  const proyecto = await prisma.proyecto.findUnique({
    where: { id_proyecto: id },
    include: {
      cliente: { select: { nombre: true } },
      estado_proyecto: { select: { estado: true } },
      tareas: {
        include: {
          usuario: { select: { nombre: true, apellido: true } },
          prioridad: { select: { nombre_prioridad: true } },
          estado_tarea: { select: { estado: true } },
        },
      },
    },
  });
  if (!proyecto) throw new NotFoundError("Proyecto no encontrado");
  return proyecto;
};

export const create = async (data: {
  nombre: string;
  descripcion?: string;
  fecha_inicio: string;
  fecha_fin?: string;
  id_cliente: number;
  id_estado_proyecto: number;
}) => {
  return await prisma.proyecto.create({
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
    nombre?: string;
    descripcion?: string;
    fecha_inicio?: string;
    fecha_fin?: string;
    id_cliente?: number;
    id_estado_proyecto?: number;
  }
) => {
  const existe = await prisma.proyecto.findUnique({ where: { id_proyecto: id } });
  if (!existe) throw new NotFoundError("Proyecto no encontrado");

  return await prisma.proyecto.update({
    where: { id_proyecto: id },
    data: {
      ...data,
      fecha_inicio: data.fecha_inicio ? new Date(data.fecha_inicio) : undefined,
      fecha_fin: data.fecha_fin ? new Date(data.fecha_fin) : undefined,
    },
  });
};

export const remove = async (id: number) => {
  const existe = await prisma.proyecto.findUnique({ where: { id_proyecto: id } });
  if (!existe) throw new NotFoundError("Proyecto no encontrado");

  await prisma.proyecto.delete({ where: { id_proyecto: id } });
  return { message: "Proyecto eliminado correctamente" };
};

// Catálogo
export const getEstadosProyecto = async () => {
  return await prisma.estadoProyecto.findMany();
};