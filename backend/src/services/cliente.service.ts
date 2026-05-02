import prisma from "../prisma/client.js";
import { NotFoundError, BadRequestError } from "../errors/AppError.js";
import { buildMeta } from "../lib/paginate.js";

export const getAll = async (
  page: number, limit: number,
  filters: { search?: string; id_empresa?: number; id_estado_cliente?: number }
) => {
  const where = {
    ...(filters.id_empresa        ? { id_empresa: filters.id_empresa }               : {}),
    ...(filters.id_estado_cliente ? { id_estado_cliente: filters.id_estado_cliente } : {}),
    ...(filters.search            ? { nombre: { contains: filters.search, mode: "insensitive" as const } } : {}),
  };

  const include = {
    empresa:        { select: { nombre: true } },
    estado_cliente: { select: { estado: true } },
  };

  const [data, total] = await Promise.all([
    prisma.cliente.findMany({ where, include, skip: (page - 1) * limit, take: limit }),
    prisma.cliente.count({ where }),
  ]);

  return { data, meta: buildMeta(total, page, limit) };
};

export const getById = async (id: number) => {
  const cliente = await prisma.cliente.findUnique({
    where: { id_cliente: id },
    include: {
      empresa: { select: { nombre: true } },
      estado_cliente: { select: { estado: true } },
    },
  });
  if (!cliente) throw new NotFoundError("Cliente no encontrado");
  return cliente;
};

export const create = async (data: {
  nombre: string;
  correo?: string;
  telefono?: string;
  id_empresa: number;
  id_estado_cliente: number;
}) => {
  if (data.correo) {
    const existe = await prisma.cliente.findUnique({ where: { correo: data.correo } });
    if (existe) throw new BadRequestError("El correo ya está registrado");
  }
  return await prisma.cliente.create({ data });
};

export const update = async (
  id: number,
  data: {
    nombre?: string;
    correo?: string;
    telefono?: string;
    id_empresa?: number;
    id_estado_cliente?: number;
  }
) => {
  const existe = await prisma.cliente.findUnique({ where: { id_cliente: id } });
  if (!existe) throw new NotFoundError("Cliente no encontrado");

  if (data.correo && data.correo !== existe.correo) {
    const correoDuplicado = await prisma.cliente.findUnique({ where: { correo: data.correo } });
    if (correoDuplicado) throw new BadRequestError("El correo ya está en uso");
  }

  return await prisma.cliente.update({
    where: { id_cliente: id },
    data,
  });
};

export const remove = async (id: number) => {
  const existe = await prisma.cliente.findUnique({ where: { id_cliente: id } });
  if (!existe) throw new NotFoundError("Cliente no encontrado");

  await prisma.cliente.delete({ where: { id_cliente: id } });
  return { message: "Cliente eliminado correctamente" };
};

// Catálogos
export const getEmpresas = async () => {
  return await prisma.empresa.findMany();
};

export const getEstadosCliente = async () => {
  return await prisma.estadoCliente.findMany();
};