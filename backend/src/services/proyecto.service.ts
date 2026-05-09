import prisma from "../prisma/client.js";
import { NotFoundError } from "../errors/AppError.js";
import { buildMeta } from "../lib/paginate.js";

export const getAll = async (
  page: number, limit: number,
  filters: { search?: string; id_cliente?: number; id_estado_proyecto?: number }
) => {
  const where = {
    ...(filters.id_cliente         ? { id_cliente: filters.id_cliente }                 : {}),
    ...(filters.id_estado_proyecto ? { id_estado_proyecto: filters.id_estado_proyecto } : {}),
    ...(filters.search             ? { nombre: { contains: filters.search, mode: "insensitive" as const } } : {}),
  };

  const include = {
    cliente:         { select: { nombre: true } },
    estado_proyecto: { select: { estado: true } },
  };

  const [data, total] = await Promise.all([
    prisma.proyecto.findMany({ where, include, skip: (page - 1) * limit, take: limit }),
    prisma.proyecto.count({ where }),
  ]);

  return { data, meta: buildMeta(total, page, limit) };
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
  id_usuario: number,
  data: {
    nombre?: string;
    descripcion?: string;
    fecha_inicio?: string;
    fecha_fin?: string;
    id_cliente?: number;
    id_estado_proyecto?: number;
    detalle?: string;
  }
) => {
  const existe = await prisma.proyecto.findUnique({ where: { id_proyecto: id } });
  if (!existe) throw new NotFoundError("Proyecto no encontrado");

  const estadoCambio =
    data.id_estado_proyecto !== undefined &&
    data.id_estado_proyecto !== existe.id_estado_proyecto;

  const { detalle, ...proyectoData } = data;

  return await prisma.$transaction(async (tx) => {
    const updated = await tx.proyecto.update({
      where: { id_proyecto: id },
      data: {
        ...proyectoData,
        fecha_inicio: proyectoData.fecha_inicio ? new Date(proyectoData.fecha_inicio) : undefined,
        fecha_fin:    proyectoData.fecha_fin    ? new Date(proyectoData.fecha_fin)    : undefined,
      },
    });

    if (estadoCambio) {
      await tx.historialProyecto.create({
        data: {
          id_proyecto:        id,
          id_estado_proyecto: data.id_estado_proyecto!,
          id_usuario,
          detalle:            detalle ?? null,
        },
      });
    }

    return updated;
  });
};

export const remove = async (id: number) => {
  const existe = await prisma.proyecto.findUnique({ where: { id_proyecto: id } });
  if (!existe) throw new NotFoundError("Proyecto no encontrado");

  await prisma.proyecto.delete({ where: { id_proyecto: id } });
  return { message: "Proyecto eliminado correctamente" };
};

export const getHistorial = async (id: number) => {
  const existe = await prisma.proyecto.findUnique({ where: { id_proyecto: id } });
  if (!existe) throw new NotFoundError("Proyecto no encontrado");

  return await prisma.historialProyecto.findMany({
    where: { id_proyecto: id },
    include: {
      estado_proyecto: { select: { estado: true } },
      usuario:         { select: { nombre: true, apellido: true } },
    },
    orderBy: { fecha_cambio: "desc" },
  });
};

// Catálogo
export const getEstadosProyecto = async () => {
  return await prisma.estadoProyecto.findMany();
};