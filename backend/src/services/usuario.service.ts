import argon2 from "argon2";
import prisma from "../prisma/client.js";
import { NotFoundError, BadRequestError } from "../errors/AppError.js";
import { buildMeta } from "../lib/paginate.js";

export const create = async (data: {
  nombre: string;
  apellido: string;
  correo: string;
  contrasena: string;
  id_rol: number;
}) => {
  const existe = await prisma.usuario.findUnique({ where: { correo: data.correo } });
  if (existe) throw new BadRequestError("El correo ya está registrado");

  const hash = await argon2.hash(data.contrasena);

  const { contrasena: _, ...usuario } = await prisma.usuario.create({
    data: { ...data, contrasena: hash, activo: true },
  });

  return usuario;
};

export const getAll = async (page: number, limit: number, search?: string) => {
  const where = search ? {
    OR: [
      { nombre:   { contains: search, mode: "insensitive" as const } },
      { apellido: { contains: search, mode: "insensitive" as const } },
      { correo:   { contains: search, mode: "insensitive" as const } },
    ],
  } : undefined;

  const select = {
    id_usuario: true, nombre: true, apellido: true,
    correo: true, activo: true, rol: { select: { nombre: true } },
  };

  const [data, total] = await Promise.all([
    prisma.usuario.findMany({ where, select, skip: (page - 1) * limit, take: limit }),
    prisma.usuario.count({ where }),
  ]);

  return { data, meta: buildMeta(total, page, limit) };
};

export const getById = async (id: number) => {
  const usuario = await prisma.usuario.findUnique({
    where: { id_usuario: id },
    select: {
      id_usuario: true,
      nombre: true,
      apellido: true,
      correo: true,
      activo: true,
      rol: { select: { nombre: true } },
    },
  });
  if (!usuario) throw new NotFoundError("Usuario no encontrado");
  return usuario;
};

export const update = async (
  id: number,
  data: { nombre?: string; apellido?: string; correo?: string; contrasena?: string; id_rol?: number }
) => {
  const existe = await prisma.usuario.findUnique({ where: { id_usuario: id } });
  if (!existe) throw new NotFoundError("Usuario no encontrado");

  if (data.correo && data.correo !== existe.correo) {
    const correoDuplicado = await prisma.usuario.findUnique({ where: { correo: data.correo } });
    if (correoDuplicado) throw new BadRequestError("El correo ya está en uso");
  }

  if (data.contrasena) {
    data.contrasena = await argon2.hash(data.contrasena);
  }

  const { contrasena: _, ...usuario } = await prisma.usuario.update({
    where: { id_usuario: id },
    data,
  });

  return usuario;
};

export const desactivar = async (id: number) => {
  const existe = await prisma.usuario.findUnique({ where: { id_usuario: id } });
  if (!existe) throw new NotFoundError("Usuario no encontrado");

  const { contrasena: _, ...usuario } = await prisma.usuario.update({
    where: { id_usuario: id },
    data: { activo: false },
  });

  return usuario;
};

export const activar = async (id: number) => {
  const existe = await prisma.usuario.findUnique({ where: { id_usuario: id } });
  if (!existe) throw new NotFoundError("Usuario no encontrado");

  const { contrasena: _, ...usuario } = await prisma.usuario.update({
    where: { id_usuario: id },
    data: { activo: true },
  });

  return usuario;
};