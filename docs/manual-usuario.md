# Manual de Usuario — Usuario

**Sistema de Gestión de Proyectos**

**Desarrollado por
Luis Daniel Casasola Chiquin
202140865**

---

## Índice

1. [Acceso al sistema](#1-acceso-al-sistema)
2. [Dashboard](#2-dashboard)
3. [Proyectos](#3-proyectos)
4. [Tareas](#4-tareas)

---

## 1. Acceso al sistema

### Iniciar sesión

1. Abre el navegador e ingresa la URL del sistema.
2. Ingresa tu **correo electrónico** y **contraseña** proporcionados por el administrador.
3. Haz clic en **Iniciar sesión**.

### Cerrar sesión

- Haz clic en el ícono de usuario en la esquina superior derecha del menú lateral y selecciona **Cerrar sesión**.

> **Nota:** Si tu sesión expira, el sistema te redirigirá automáticamente a la pantalla de inicio de sesión.

---

## 2. Dashboard

Al ingresar al sistema verás el **Dashboard** con un resumen de tu actividad y el estado general de los proyectos.

### Tarjetas de resumen

Muestra los totales generales de:

| Tarjeta   | Descripción                      |
| --------- | -------------------------------- |
| Clientes  | Total de clientes registrados    |
| Proyectos | Total de proyectos en el sistema |
| Tareas    | Total de tareas registradas      |

Haz clic en cualquier tarjeta para ir directamente al módulo correspondiente.

### Gráficas

- **Proyectos por estado** — Dona con la distribución de todos los proyectos según su estado.
- **Mis tareas por estado** — Barras horizontales con el conteo de tus tareas asignadas por estado.
- **Mis tareas por prioridad** — Barras horizontales con el conteo de tus tareas asignadas por prioridad.

> Las gráficas de tareas muestran únicamente **tus tareas**, no las de otros usuarios.

### Mis tareas pendientes

Lista tus tareas con estado **Pendiente** o **En progreso**, ordenadas por prioridad (Crítica primero). Se muestran hasta 5 tareas. Haz clic en **Ver todas** para ir al módulo de Tareas.

---

## 3. Proyectos

Desde el menú lateral, selecciona **Proyectos**.

### Ver proyectos

La tabla muestra todos los proyectos del sistema con nombre, cliente, estado, fecha de inicio y fecha fin. Puedes buscar por nombre o cliente y navegar entre páginas.

### Ver detalle de un proyecto

Haz clic en el nombre de cualquier proyecto para abrir su página de detalle. Desde aquí puedes ver:

- **Información general** — cliente, estado, fechas y descripción del proyecto.
- **Tareas del proyecto** — lista de todas las tareas asociadas con responsable, prioridad y estado.
- **Historial de estados** — línea de tiempo con cada cambio de estado registrado, incluyendo quién lo realizó, cuándo y el motivo.

### Agregar una tarea al proyecto

1. Desde la página de detalle, en la sección **Tareas**, haz clic en **Nueva tarea**.
2. Completa el formulario:
   - **Nombre** _(obligatorio)_
   - **Responsable** _(obligatorio)_ — usuario asignado
   - **Prioridad** _(obligatorio)_ — Crítica, Alta, Media, Baja
   - **Estado** _(obligatorio)_ — Pendiente, En progreso, Completada, Cancelada
   - **Fecha inicio** _(obligatorio)_
   - **Fecha fin** _(opcional)_
   - **Descripción** _(opcional)_
3. Haz clic en **Crear tarea**.

La tarea queda asociada automáticamente al proyecto.

### Exportar PDF del proyecto

Desde la página de detalle, haz clic en **Exportar PDF**. Se descargará un documento con:

- Información completa del proyecto
- Resumen de tareas (total, completadas, en progreso, pendientes)
- Tabla de tareas con colores por prioridad y estado
- Historial de cambios de estado
- Pie de página con número de página y fecha de exportación

---

## 4. Tareas

Desde el menú lateral, selecciona **Tareas**.

### Ver tareas

La tabla muestra todas las tareas del sistema con: nombre, proyecto, responsable, prioridad, estado y fecha fin. Puedes buscar por nombre de tarea o proyecto y navegar entre páginas.

### Crear tarea

1. Haz clic en **Nueva tarea**.
2. Completa el formulario:
   - **Nombre** _(obligatorio)_
   - **Proyecto** _(obligatorio)_ — selecciona de la lista
   - **Responsable** _(obligatorio)_ — usuario asignado
   - **Prioridad** _(obligatorio)_ — Crítica, Alta, Media, Baja
   - **Estado** _(obligatorio)_ — Pendiente, En progreso, Completada, Cancelada
   - **Fecha inicio** _(obligatorio)_
   - **Fecha fin** _(opcional)_
   - **Descripción** _(opcional)_
3. Haz clic en **Guardar**.

### Editar tarea

1. En la tabla, haz clic en el menú **⋮** de la fila.
2. Selecciona **Editar**, modifica los campos necesarios y guarda.

### Eliminar tarea

1. En la tabla, haz clic en el menú **⋮** de la fila.
2. Selecciona **Eliminar** y confirma la acción.

---

## Estados y colores de referencia

### Estados de proyecto

| Estado        | Color    |
| ------------- | -------- |
| Planificación | Azul     |
| En progreso   | Amarillo |
| Finalizado    | Verde    |
| Cancelado     | Gris     |
| Pausado       | Morado   |

### Estados y prioridades de tarea

| Estado      | Color    |
| ----------- | -------- |
| Pendiente   | Gris     |
| En progreso | Amarillo |
| Completada  | Verde    |
| Cancelada   | Rojo     |

| Prioridad | Color   |
| --------- | ------- |
| Crítica   | Rojo    |
| Alta      | Naranja |
| Media     | Azul    |
| Baja      | Gris    |
