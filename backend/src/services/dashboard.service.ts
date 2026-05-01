import prisma from "../prisma/client.js";

export const getStats = async () => {
  const [totalClientes, totalProyectos, totalTareas, totalUsuarios] = await Promise.all([
    prisma.cliente.count(),
    prisma.proyecto.count(),
    prisma.tarea.count(),
    prisma.usuario.count({ where: { activo: true } }),
  ]);

  return { totalClientes, totalProyectos, totalTareas, totalUsuarios };
};
