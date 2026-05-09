import prisma from "../prisma/client.js";
import { NotFoundError, BadRequestError } from "../errors/AppError.js";

export const getAll = async () => {
  return await prisma.empresa.findMany({
    include: { _count: { select: { clientes: true } } },
    orderBy: { nombre: "asc" },
  });
};

export const create = async (data: { nombre: string }) => {
  const existe = await prisma.empresa.findFirst({
    where: { nombre: { equals: data.nombre, mode: "insensitive" } },
  });
  if (existe) throw new BadRequestError("Ya existe una empresa con ese nombre");
  return await prisma.empresa.create({ data });
};

export const update = async (id: number, data: { nombre?: string }) => {
  const empresa = await prisma.empresa.findUnique({ where: { id_empresa: id } });
  if (!empresa) throw new NotFoundError("Empresa no encontrada");

  if (data.nombre) {
    const duplicado = await prisma.empresa.findFirst({
      where: { nombre: { equals: data.nombre, mode: "insensitive" }, NOT: { id_empresa: id } },
    });
    if (duplicado) throw new BadRequestError("Ya existe una empresa con ese nombre");
  }

  return await prisma.empresa.update({ where: { id_empresa: id }, data });
};

export const remove = async (id: number) => {
  const empresa = await prisma.empresa.findUnique({
    where: { id_empresa: id },
    include: { _count: { select: { clientes: true } } },
  });
  if (!empresa) throw new NotFoundError("Empresa no encontrada");
  if (empresa._count.clientes > 0)
    throw new BadRequestError("No se puede eliminar: la empresa tiene clientes asociados");

  await prisma.empresa.delete({ where: { id_empresa: id } });
};
