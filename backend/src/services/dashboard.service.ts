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

export const getCharts = async (id_usuario: number) => {
  const [
    proyectosRaw,
    tareasEstadoRaw,
    tareasPrioridadRaw,
    misTareasEstadoRaw,
    misTareasPrioridadRaw,
  ] = await Promise.all([
    // Proyectos agrupados por estado (global)
    prisma.proyecto.groupBy({
      by: ["id_estado_proyecto"],
      _count: { id_proyecto: true },
      orderBy: { id_estado_proyecto: "asc" },
    }),
    // Tareas agrupadas por estado (global)
    prisma.tarea.groupBy({
      by: ["id_estado_tarea"],
      _count: { id_tarea: true },
      orderBy: { id_estado_tarea: "asc" },
    }),
    // Tareas agrupadas por prioridad (global)
    prisma.tarea.groupBy({
      by: ["id_prioridad"],
      _count: { id_tarea: true },
      orderBy: { id_prioridad: "asc" },
    }),
    // Mis tareas por estado
    prisma.tarea.groupBy({
      by: ["id_estado_tarea"],
      where: { id_usuario },
      _count: { id_tarea: true },
      orderBy: { id_estado_tarea: "asc" },
    }),
    // Mis tareas por prioridad
    prisma.tarea.groupBy({
      by: ["id_prioridad"],
      where: { id_usuario },
      _count: { id_tarea: true },
      orderBy: { id_prioridad: "asc" },
    }),
    ]);

  // Resolver nombres de estados y prioridades
  const [estadosProyecto, estadosTarea, prioridades] = await Promise.all([
    prisma.estadoProyecto.findMany(),
    prisma.estadoTarea.findMany(),
    prisma.prioridad.findMany(),
  ]);

  const proyectosPorEstado = proyectosRaw
    .map((r) => ({
      estado: estadosProyecto.find((e) => e.id_estado_proyecto === r.id_estado_proyecto)?.estado ?? "Desconocido",
      total:  r._count.id_proyecto,
    }))
    .filter((r) => r.total > 0);

  const tareasPorEstado = tareasEstadoRaw
    .map((r) => ({
      estado: estadosTarea.find((e) => e.id_estado_tarea === r.id_estado_tarea)?.estado ?? "Desconocido",
      total:  r._count.id_tarea,
    }))
    .filter((r) => r.total > 0);

  const tareasPorPrioridad = tareasPrioridadRaw
    .map((r) => ({
      prioridad: prioridades.find((p) => p.id_prioridad === r.id_prioridad)?.nombre_prioridad ?? "Desconocida",
      total:     r._count.id_tarea,
    }))
    .sort((a, b) => (PRIORIDAD_ORDEN[a.prioridad] ?? 99) - (PRIORIDAD_ORDEN[b.prioridad] ?? 99))
    .filter((r) => r.total > 0);

  const misTareasPorEstado = misTareasEstadoRaw
    .map((r) => ({
      estado: estadosTarea.find((e) => e.id_estado_tarea === r.id_estado_tarea)?.estado ?? "Desconocido",
      total:  r._count.id_tarea,
    }))
    .filter((r) => r.total > 0);

  const misTareasPorPrioridad = misTareasPrioridadRaw
    .map((r) => ({
      prioridad: prioridades.find((p) => p.id_prioridad === r.id_prioridad)?.nombre_prioridad ?? "Desconocida",
      total:     r._count.id_tarea,
    }))
    .sort((a, b) => (PRIORIDAD_ORDEN[a.prioridad] ?? 99) - (PRIORIDAD_ORDEN[b.prioridad] ?? 99))
    .filter((r) => r.total > 0);

  return {
    proyectosPorEstado,
    tareasPorEstado,
    tareasPorPrioridad,
    misTareasPorEstado,
    misTareasPorPrioridad,
  };
};
