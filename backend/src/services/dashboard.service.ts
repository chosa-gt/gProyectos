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

const PRIORIDAD_ORDEN: Record<string, number> = {
  "Crítica": 0, "Alta": 1, "Media": 2, "Baja": 3,
};

export const getMisTareas = async (id_usuario: number) => {
  const tareas = await prisma.tarea.findMany({
    where: {
      id_usuario,
      estado_tarea: { estado: { in: ["Pendiente", "En progreso"] } },
    },
    include: {
      proyecto:     { select: { nombre: true } },
      prioridad:    { select: { nombre_prioridad: true } },
      estado_tarea: { select: { estado: true } },
    },
  });

  return tareas
    .sort((a, b) => {
      const pa = PRIORIDAD_ORDEN[a.prioridad.nombre_prioridad ?? ""] ?? 99;
      const pb = PRIORIDAD_ORDEN[b.prioridad.nombre_prioridad ?? ""] ?? 99;
      return pa - pb;
    })
    .slice(0, 5);
};
