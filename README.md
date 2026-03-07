![Status](https://img.shields.io/badge/Status-En_Desarrollo-yellow)
![License](https://img.shields.io/badge/License-MIT-blue)

# Sistema de Gestion de Proyectos - SGP

Este sistema empieza su desarrollo, buscando cumplir ciertos requerimientos para un sistema de gestion de proyectos que solucionara los problemas de una empresa que puede que esten teniendo, tal como la gestion de usuarios o colaboradores que gestionan informacion de clientes que tiene uno o mas proyectos en la empresa y como ultimo buscar como darle seguimiento a las tareas de cada proyecto.

## Que tecnologia usaremos?

### Backend (API REST)

- **Lenguaje:** TypeScript
- **Runtime:** Node.js
- **Gestor de Versiones:** fnm
- **Framework:** Express
- **Seguridad:** JSON Web Tokens (JWT) para autenticación.

### Frontend

- **Framework:** React + Vite
- **Estilos:** Tailwind CSS
- **Comunicación:** Consumo de API REST.

### Base de Datos & Nube

- **Motor de BD:** PostgreSQL
- **ORM/Query Builder:** Prisma

### App Móvil Android

- **Framework:** React Native (reutiliza conocimiento de React)

---

## Que encontraras en este repositorio?

Aqui encontraras el backend, como el frontend, querys para la creacion de la base de datos, entre otras cosas.

## Características Principales

Basado en los requerimientos funcionales del proyecto integrador:

### Gestión de Usuarios

- Registro e inicio de sesión seguro (JWT).
- Control de acceso basado en roles (**Administrador** y **Usuario**).

### Gestión de Clientes

- CRUD completo (Crear, Leer, Actualizar, Eliminar) de clientes.
- Almacenamiento de datos de contacto y estado empresarial.

### Gestión de Proyectos

- Vinculación de proyectos a clientes existentes.
- Control de fechas (inicio/fin) y estados de proyecto.

### Gestión de Tareas

- Asignación de tareas a proyectos específicos.
- Definición de responsables, prioridades y seguimiento de avance.

## Estructura del Repositorio

Este repositorio sigue una estructura de **Monorepo**:

```text
/
├── /backend         # Código fuente del servidor (API Node.js)
├── /frontend        # Código fuente del cliente
├── /database        # Scripts SQL y diagramas ER
├── /docs            # Documentación técnica adicional y manuales
└── README.md        # Este archivo
```
