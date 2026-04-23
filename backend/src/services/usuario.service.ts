import argon2 from "argon2";
import prisma from "../prisma/client.js";
import { NotFoundError, BadRequestError } from "../errors/AppError.js";

export const getAll = async () => {
  return await prisma.usuario.findMany({
    select: {
      id_usuario: true,
      nombre: true,
      apellido: true,
      correo: true,
      activo: true,
      rol: { select: { nombre: true } },
    },
  });
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