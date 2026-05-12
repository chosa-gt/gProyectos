export interface Usuario {
  id_usuario: number;
  nombre: string;
  apellido: string;
  correo: string;
  activo: boolean;
  id_rol: number;
  rol?: { nombre: string };
}

export interface AuthUsuario {
  id_usuario: number;
  id_rol: number;
  nombre?: string;
  apellido?: string;
  correo?: string;
}

export interface Cliente {
  id_cliente: number;
  nombre: string;
  correo: string;
  telefono: string;
  id_empresa: number;
  id_estado_cliente: number;
  empresa?: { nombre: string };
  estado_cliente?: { estado: string };
}

export interface EstadoProyecto {
  id_estado_proyecto: number;
  estado: string;
}

export interface HistorialProyecto {
  id_historial: number;
  id_proyecto: number;
  id_estado_proyecto: number;
  id_usuario: number;
  detalle: string;
  fecha_cambio: string;
  estado_proyecto: { estado: string };
  usuario: { nombre: string; apellido: string };
}

export interface Proyecto {
  id_proyecto: number;
  nombre: string;
  descripcion: string;
  fecha_inicio: string;
  fecha_fin?: string;
  id_cliente: number;
  id_estado_proyecto: number;
  cliente?: { nombre: string };
  estado_proyecto?: { estado: string };
  tareas?: Tarea[];
  historial?: HistorialProyecto[];
}

export interface Tarea {
  id_tarea: number;
  tarea: string;
  descripcion: string;
  fecha_inicio: string;
  fecha_fin?: string;
  id_proyecto: number;
  id_usuario: number;
  id_prioridad: number;
  id_estado_tarea: number;
  proyecto?: { nombre: string };
  usuario?: { nombre: string; apellido: string };
  prioridad?: { nombre_prioridad: string };
  estado_tarea?: { estado: string };
}

export interface Empresa {
  id_empresa: number;
  nombre: string;
}

export interface DashboardStats {
  totalClientes: number;
  totalProyectos: number;
  totalTareas: number;
  totalUsuarios: number;
}

export interface ItemPorEstado {
  estado: string;
  total: number;
}

export interface ItemPorPrioridad {
  prioridad: string;
  total: number;
}

export interface DashboardCharts {
  proyectosPorEstado: ItemPorEstado[];
  tareasPorEstado: ItemPorEstado[];
  tareasPorPrioridad: ItemPorPrioridad[];
  misTareasPorEstado: ItemPorEstado[];
  misTareasPorPrioridad: ItemPorPrioridad[];
}
