# Manual de Usuario — Administrador

**Sistema de Gestión de Proyectos**

**Desarrollado por
Luis Daniel Casasola Chiquin
202140865**

---

## Índice

1. [Acceso al sistema](#1-acceso-al-sistema)
2. [Dashboard](#2-dashboard)
3. [Clientes](#3-clientes)
4. [Proyectos](#4-proyectos)
5. [Tareas](#5-tareas)
6. [Usuarios](#6-usuarios)

---

## 1. Acceso al sistema

### Iniciar sesión

1. Abre el navegador e ingresa la URL del sistema.
2. Ingresa tu **correo electrónico** y **contraseña**.
3. Haz clic en **Iniciar sesión**.

### Cerrar sesión

- Haz clic en el ícono de usuario en la esquina superior derecha del menú lateral y selecciona **Cerrar sesión**.

> **Nota:** Si tu sesión expira, el sistema te redirigirá automáticamente a la pantalla de inicio de sesión.

---

## 2. Dashboard

Al ingresar al sistema verás el **Dashboard**, que muestra un resumen general del estado de la organización.

### Tarjetas de resumen

Muestra el total actual de:

| Tarjeta   | Descripción                                                   |
| --------- | ------------------------------------------------------------- |
| Clientes  | Total de clientes registrados                                 |
| Proyectos | Total de proyectos en el sistema                              |
| Tareas    | Total de tareas registradas                                   |
| Usuarios  | Total de usuarios activos (solo visible para administradores) |

Haz clic en cualquier tarjeta para ir directamente al módulo correspondiente.

### Gráficas

- **Proyectos por estado** — Dona con la distribución de proyectos según su estado actual.
- **Tareas por estado** — Barras horizontales con el conteo de tareas por estado (global).
- **Tareas por prioridad** — Barras horizontales con el conteo de tareas por prioridad (global).

### Mis tareas pendientes

Lista las tareas que tienes asignadas con estado **Pendiente** o **En progreso**, ordenadas por prioridad. Muestra hasta 5 tareas. Haz clic en cualquier fila o en **Ver todas** para ir al módulo de Tareas.

---

## 3. Clientes

Desde el menú lateral, selecciona **Clientes**.

### Ver clientes

La tabla muestra el listado de todos los clientes con nombre, empresa, contacto y correo. Usa la barra de búsqueda para filtrar por cualquier campo. La tabla está paginada (10 registros por página).

### Agregar cliente

1. Haz clic en **Agregar cliente** (botón azul, esquina superior derecha).
2. Completa el formulario:
   - **Nombre** _(obligatorio)_
   - **Empresa** _(obligatorio)_
   - **Contacto** — nombre de la persona de contacto
   - **Correo**
   - **Teléfono**
3. Haz clic en **Guardar**.

### Editar cliente

1. En la tabla, haz clic en el menú **⋮** de la fila del cliente.
2. Selecciona **Editar**.
3. Modifica los campos necesarios y haz clic en **Guardar**.

### Eliminar cliente

1. En la tabla, haz clic en el menú **⋮** de la fila del cliente.
2. Selecciona **Eliminar**.
3. Confirma la acción en el cuadro de diálogo.

> **Advertencia:** Eliminar un cliente es permanente. Si el cliente tiene proyectos asociados, debes eliminar o reasignar esos proyectos primero.

---

## 4. Proyectos

Desde el menú lateral, selecciona **Proyectos**.

### Ver proyectos

La tabla muestra todos los proyectos con nombre, cliente, estado, fecha de inicio y fecha fin. Puedes buscar por nombre o cliente y navegar entre páginas.

### Crear proyecto

1. Haz clic en **Nuevo proyecto**.
2. Completa el formulario:
   - **Nombre** _(obligatorio)_
   - **Cliente** _(obligatorio)_ — selecciona de la lista de clientes registrados
   - **Estado** _(obligatorio)_ — Planificación, En progreso, Finalizado, Cancelado, Pausado
   - **Fecha inicio** _(obligatorio)_
   - **Fecha fin** _(opcional)_
   - **Descripción** _(opcional)_
3. Haz clic en **Guardar**.

### Ver detalle de proyecto

Haz clic en el nombre de cualquier proyecto para abrir su página de detalle, que contiene:

- Información general (cliente, estado, fechas, descripción)
- Tabla de tareas del proyecto
- Historial de cambios de estado

### Editar proyecto

Desde la página de detalle, haz clic en **Editar**.

> **Cambio de estado:** Si cambias el estado del proyecto, el campo **Detalle del cambio** se vuelve obligatorio. Este registro queda guardado en el historial.

### Agregar tarea desde el proyecto

1. Desde la página de detalle, en la sección **Tareas**, haz clic en **Nueva tarea**.
2. Completa el formulario (ver sección [Tareas](#5-tareas)).
3. Haz clic en **Crear tarea**.

La tarea queda asociada automáticamente al proyecto actual.

### Exportar PDF

Desde la página de detalle, haz clic en **Exportar PDF**. Se descargará un archivo con:

- Información del proyecto (cliente, estado, fechas, descripción)
- Resumen de tareas (total, completadas, en progreso, pendientes)
- Tabla de tareas con colores por prioridad y estado
- Historial de cambios de estado
- Pie de página con número de página y fecha de exportación

### Historial de estados

En la parte inferior de la página de detalle se muestra una línea de tiempo con cada cambio de estado registrado: estado nuevo, usuario que realizó el cambio, fecha/hora y motivo del cambio.

### Eliminar proyecto

1. En la tabla de Proyectos, haz clic en el menú **⋮** de la fila.
2. Selecciona **Eliminar** y confirma.

---

## 5. Tareas

Desde el menú lateral, selecciona **Tareas**.

### Ver tareas

La tabla muestra todas las tareas del sistema con: nombre, proyecto, responsable, prioridad, estado y fecha fin. Puedes buscar por nombre de tarea o proyecto y paginar los resultados.

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
2. Selecciona **Editar**, modifica los campos y guarda.

### Eliminar tarea

1. En la tabla, haz clic en el menú **⋮** de la fila.
2. Selecciona **Eliminar** y confirma.

---

## 6. Usuarios

> Este módulo es exclusivo del **Administrador**.

Desde el menú lateral, selecciona **Usuarios**.

### Ver usuarios

La tabla muestra todos los usuarios activos con nombre, apellido, correo y rol.

### Crear usuario

1. Haz clic en **Agregar usuario**.
2. Completa:
   - **Nombre** y **Apellido** _(obligatorios)_
   - **Correo electrónico** _(obligatorio)_
   - **Contraseña** _(obligatoria)_
   - **Rol** — Administrador o Usuario
3. Haz clic en **Guardar**.

### Editar usuario

1. En la tabla, haz clic en el menú **⋮** de la fila.
2. Selecciona **Editar**, modifica los campos y guarda.

> Puedes cambiar el nombre, apellido, correo y rol. La contraseña solo se actualiza si ingresas un valor en el campo correspondiente.

### Desactivar usuario

1. En la tabla, haz clic en el menú **⋮** de la fila.
2. Selecciona **Desactivar**.
3. Confirma la acción en el cuadro de diálogo.

El usuario desactivado ya no podrá iniciar sesión. Para reactivarlo, vuelve al menú **⋮** y selecciona **Activar**.

> **Restricción:** Un administrador no puede desactivar su propia cuenta.

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
