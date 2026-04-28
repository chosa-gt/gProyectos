export interface Rol {
  id_rol: number;
  nombre: string;
}

export interface Usuario {
  id_usuario: number;
  nombre: string;
  apellido: string;
  correo: string;
  activo: boolean;
  rol: { nombre: string };
}

export interface Empresa {
  id_empresa: number;
  nombre: string;
}

export interface EstadoCliente {
  id_estado_cliente: number;
  estado: string;
}

export interface Cliente {
  id_cliente: number;
  nombre: string;
  correo: string;
  telefono: string;
  id_empresa: number;
  id_estado_cliente: number;
  empresa: { nombre: string };
  estado_cliente: { estado: string };
}

export interface EstadoProyecto {
  id_estado_proyecto: number;
  estado: string;
}

export interface Proyecto {
  id_proyecto: number;
  nombre: string;
  descripcion: string;
  fecha_inicio: string;
  fecha_fin: string | null;
  id_cliente: number;
  id_estado_proyecto: number;
  cliente: { nombre: string };
  estado_proyecto: { estado: string };
  tareas?: Tarea[];
}

export interface Prioridad {
  id_prioridad: number;
  nombre_prioridad: string;
}

export interface EstadoTarea {
  id_estado_tarea: number;
  estado: string;
}

export interface Tarea {
  id_tarea: number;
  tarea: string;
  descripcion: string;
  fecha_inicio: string;
  fecha_fin: string | null;
  id_proyecto: number;
  id_usuario: number;
  id_prioridad: number;
  id_estado_tarea: number;
  usuario: { nombre: string; apellido: string };
  prioridad: { nombre_prioridad: string };
  estado_tarea: { estado: string };
  proyecto: { nombre: string };
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  usuario: Omit<Usuario, "rol">;
}