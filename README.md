# Sistema de Gestión de Proyectos — SGP

![Status](https://img.shields.io/badge/Estado-Desplegado-brightgreen)
![License](https://img.shields.io/badge/Licencia-MIT-blue)
![Node](https://img.shields.io/badge/Node.js-22.x-339933?logo=node.js)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-336791?logo=postgresql)

Aplicación web fullstack para la gestión integral de proyectos empresariales. Permite administrar clientes, proyectos, tareas y usuarios con control de acceso por roles, historial de cambios de estado y exportación de reportes en PDF.

## Demo en vivo

| Servicio | URL |
|----------|-----|
| Frontend | https://g-proyectos.vercel.app |
| API | https://gproyectos-production.up.railway.app/api |

> Credenciales de prueba — Admin: `admin@gproyectos.com` / `Admin123!`

---

## Características

### Autenticación y seguridad
- Registro e inicio de sesión con JWT (access token + refresh token)
- Refresco silencioso de sesión con reintento automático
- Control de acceso por roles: **Administrador** y **Usuario**
- Contraseñas hasheadas con Argon2id

### Dashboard
- Tarjetas de resumen con totales globales (clientes, proyectos, tareas, usuarios)
- Gráficas interactivas: proyectos por estado (dona) y tareas por estado/prioridad (barras)
- Las gráficas de tareas son **role-aware**: el administrador ve datos globales, el usuario ve solo sus tareas
- Lista de tareas pendientes asignadas al usuario, ordenadas por prioridad

### Módulo Clientes
- CRUD completo con paginación y búsqueda en tiempo real
- Asociación a empresa y estado (Activo / Inactivo / Prospecto)
- Historial de proyectos por cliente

### Módulo Proyectos
- CRUD completo con paginación y búsqueda
- Estados: Planificación · En progreso · Finalizado · Cancelado · Pausado
- Cambio de estado con campo de detalle obligatorio (trazabilidad)
- Historial de cambios de estado en línea de tiempo
- Página de detalle con tabla de tareas asociadas
- **Exportación a PDF** con información del proyecto, resumen de tareas, tabla con colores semánticos e historial de estados

### Módulo Tareas
- CRUD completo con paginación y búsqueda
- Prioridades: Crítica · Alta · Media · Baja
- Asignación a proyecto y responsable
- Creación de tareas directamente desde el detalle del proyecto

### Módulo Usuarios *(solo Administrador)*
- CRUD completo con paginación
- Activación / desactivación de cuentas (soft delete)
- Asignación de roles

---

## Tech Stack

| Capa | Tecnología |
|------|-----------|
| Runtime | Node.js 22 |
| API | Express 5 + TypeScript |
| ORM | Prisma 7 (adapter PrismaPg) |
| Base de datos | PostgreSQL 17 |
| Autenticación | JSON Web Tokens + Argon2id |
| Validación | Zod 4 |
| Frontend | React 19 + Vite + TypeScript |
| Estilos | Tailwind CSS 4 + shadcn/ui |
| Estado global | Zustand 5 |
| Routing | React Router 7 |
| HTTP client | Axios (con interceptores de auth) |
| Gráficas | Recharts |
| PDF | jsPDF + jspdf-autotable |
| Notificaciones | Sonner |
| Deploy backend | Railway |
| Deploy frontend | Vercel |

---

## Estructura del repositorio

```
/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma        # Modelos y relaciones
│   │   ├── migrations/          # Historial de migraciones
│   │   └── seed.ts              # Datos iniciales (catálogos)
│   ├── src/
│   │   ├── controllers/         # Parsean request, llaman al service, responden JSON
│   │   ├── services/            # Lógica de negocio y queries Prisma
│   │   ├── routes/              # Registro de rutas y middlewares por módulo
│   │   ├── middlewares/         # auth, roles, validación Zod, manejo de errores
│   │   ├── schemas/             # Schemas de validación con Zod
│   │   ├── errors/              # AppError, NotFoundError, ForbiddenError, etc.
│   │   ├── types/               # Extensión de tipos de Express (req.usuario)
│   │   └── prisma/              # Singleton del cliente Prisma con adaptador PG
│   ├── .env.example
│   ├── prisma.config.ts         # Configuración de Prisma 7 (datasource, schema path)
│   ├── railway.json             # Configuración de deploy (preDeployCommand, startCommand)
│   └── nixpacks.toml            # Fuerza instalación de devDependencies en Railway
│
├── frontend/
│   ├── src/
│   │   ├── api/                 # Una función por endpoint, tipadas con interfaces
│   │   ├── components/
│   │   │   ├── ui/              # Componentes generados por shadcn/ui (no editar)
│   │   │   └── shared/          # Layout, ProtectedRoute, Sidebar, Header
│   │   ├── pages/               # Una carpeta por módulo (auth, dashboard, clientes…)
│   │   ├── store/               # auth.store.ts — Zustand persistido en localStorage
│   │   └── types/               # index.ts — interfaces compartidas (Proyecto, Tarea…)
│   ├── .env.example
│   └── vercel.json              # Rewrite /* → /index.html para SPA routing
│
├── database/
│   ├── seed_railway.sql         # Script SQL completo para poblar la BD en producción
│   └── *.xlsx / *.pod           # Diagramas y EDT del proyecto
│
├── docs/
│   ├── manual-administrador.md  # Manual de usuario para el rol Administrador
│   └── manual-usuario.md        # Manual de usuario para el rol Usuario
│
└── api-test/                    # Colección Bruno para pruebas manuales de la API
```

---

## Instalación local

### Requisitos previos
- Node.js 22+
- PostgreSQL 15+ corriendo localmente
- npm 10+

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/gProyectos.git
cd gProyectos
```

### 2. Configurar el Backend

```bash
cd backend
npm install
```

Crea el archivo `.env` basándote en `.env.example`:

```bash
cp .env.example .env
```

Edita `.env` con tus valores locales:

```env
DATABASE_URL=postgresql://postgres:tu_password@localhost:5432/gproyectos
JWT_SECRET=un_string_largo_y_aleatorio
JWT_REFRESH_SECRET=otro_string_diferente
FRONTEND_URL=http://localhost:5173
PORT=3000
```

Aplica las migraciones y genera el cliente Prisma:

```bash
npx prisma migrate dev
```

Inicia el servidor en modo desarrollo:

```bash
npm run dev
```

El API queda disponible en `http://localhost:3000/api`.

### 3. Configurar el Frontend

```bash
cd ../frontend
npm install
```

Crea el archivo `.env`:

```bash
cp .env.example .env
```

El contenido por defecto ya apunta al backend local:

```env
VITE_API_URL=http://localhost:3000/api
```

Inicia el servidor de desarrollo:

```bash
npm run dev
```

La aplicación queda disponible en `http://localhost:5173`.

### 4. Datos iniciales (opcional)

Para insertar catálogos base y datos de prueba, ejecuta el seed contra tu BD local:

```bash
cd backend
npm run seed
```

O importa `database/seed_railway.sql` directamente en tu cliente de PostgreSQL.

---

## Variables de entorno

### Backend — `backend/.env`

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `DATABASE_URL` | Cadena de conexión PostgreSQL | `postgresql://user:pass@localhost:5432/db` |
| `JWT_SECRET` | Secreto para firmar access tokens | string aleatorio de 64+ chars |
| `JWT_REFRESH_SECRET` | Secreto para firmar refresh tokens | string diferente al anterior |
| `FRONTEND_URL` | URL del frontend (CORS) | `http://localhost:5173` |
| `PORT` | Puerto del servidor | `3000` |

### Frontend — `frontend/.env`

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `VITE_API_URL` | URL base de la API | `http://localhost:3000/api` |

---

## Scripts disponibles

### Backend

```bash
npm run dev      # Servidor con hot-reload (tsx watch)
npm run build    # Compila TypeScript → dist/
npm start        # Inicia el servidor compilado
npm run seed     # Inserta datos iniciales (trunca tablas primero)
```

### Frontend

```bash
npm run dev      # Servidor de desarrollo Vite
npm run build    # Build de producción → dist/
npm run lint     # ESLint
```

---

## Despliegue en producción

El proyecto está configurado para desplegarse en **Railway** (backend + PostgreSQL) y **Vercel** (frontend).

### Railway — Backend
- **Root directory:** `backend`
- **Build command:** `npm run build` (ejecuta `prisma generate && tsc`)
- **Pre-deploy command:** `npx prisma migrate deploy` (migraciones automáticas)
- **Start command:** `node dist/src/index.js`
- Variables requeridas: `DATABASE_URL` (referenciada con `${{Postgres.DATABASE_URL}}`), `JWT_SECRET`, `JWT_REFRESH_SECRET`, `FRONTEND_URL`, `NODE_ENV=production`

### Vercel — Frontend
- **Root directory:** `frontend`
- **Build command:** `npm run build`
- **Output directory:** `dist`
- Variables requeridas: `VITE_API_URL=https://tu-backend.railway.app/api`

> El archivo `frontend/vercel.json` redirige todas las rutas a `index.html` para el correcto funcionamiento de React Router.

---

## Autor

**Luis Daniel Casasola Chiquin** — 202140865

---

## Licencia

Este proyecto está bajo la licencia [MIT](https://opensource.org/licenses/MIT).
