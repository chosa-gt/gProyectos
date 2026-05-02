import argon2 from "argon2";
import jwt from "jsonwebtoken";
import prisma from "../prisma/client.js";
import { UnauthorizedError, BadRequestError } from "../errors/AppError.js";

const ACCESS_SECRET  = process.env.JWT_SECRET!;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;
const ACCESS_EXPIRES  = "15m";
const REFRESH_EXPIRES = "7d";

export const register = async (
  nombre: string,
  apellido: string,
  correo: string,
  contrasena: string,
) => {
  const existe = await prisma.usuario.findUnique({ where: { correo } });
  if (existe) throw new BadRequestError("El correo ya está registrado");

  const hash = await argon2.hash(contrasena);

  // El auto-registro público siempre crea un usuario regular (rol 2)
  const { contrasena: _, ...usuario } = await prisma.usuario.create({
    data: { nombre, apellido, correo, contrasena: hash, id_rol: 2, activo: true },
  });

  return usuario;
};

export const login = async (correo: string, contrasena: string) => {
  const usuario = await prisma.usuario.findUnique({ where: { correo } });
  if (!usuario || !usuario.activo)
    throw new UnauthorizedError("Credenciales inválidas");

  const valida = await argon2.verify(usuario.contrasena, contrasena);
  if (!valida) throw new UnauthorizedError("Credenciales inválidas");

  const accessToken  = generateAccessToken(usuario.id_usuario, usuario.id_rol);
  const refreshToken = generateRefreshToken(usuario.id_usuario);

  // Guardar refresh token en BD
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await prisma.refreshToken.create({
    data: { token: refreshToken, id_usuario: usuario.id_usuario, expires_at: expiresAt },
  });

  const { contrasena: _, ...usuarioSinPassword } = usuario;

  return { accessToken, refreshToken, usuario: usuarioSinPassword };
};

export const refresh = async (token: string) => {
  const stored = await prisma.refreshToken.findUnique({ where: { token } });
  if (!stored || stored.expires_at < new Date())
    throw new UnauthorizedError("Refresh token inválido o expirado");

  try {
    const payload = jwt.verify(token, REFRESH_SECRET) as { id_usuario: number };
    const usuario = await prisma.usuario.findUnique({
      where: { id_usuario: payload.id_usuario },
    });
    if (!usuario || !usuario.activo)
      throw new UnauthorizedError("Usuario no encontrado");

    const accessToken = generateAccessToken(usuario.id_usuario, usuario.id_rol);
    return { accessToken };
  } catch {
    throw new UnauthorizedError("Refresh token inválido");
  }
};

export const logout = async (token: string) => {
  await prisma.refreshToken.deleteMany({ where: { token } });
};

const generateAccessToken = (id_usuario: number, id_rol: number) =>
  jwt.sign({ id_usuario, id_rol }, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES });

const generateRefreshToken = (id_usuario: number) =>
  jwt.sign({ id_usuario }, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES });