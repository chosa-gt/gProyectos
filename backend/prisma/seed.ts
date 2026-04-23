import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Limpiar tablas antes de insertar
await prisma.$executeRaw`TRUNCATE TABLE estado_cliente, estado_proyecto, estado_tarea, prioridad, empresa, rol RESTART IDENTITY CASCADE`;
  // Roles
  await prisma.rol.createMany({
    data: [{ nombre: "Administrador" }, { nombre: "Usuario" }],
    skipDuplicates: true,
  });

  // Estado Cliente
  await prisma.estadoCliente.createMany({
    data: [{ estado: "Activo" }, { estado: "Inactivo" }, { estado: "Prospecto" }],
    skipDuplicates: true,
  });

  // Estado Proyecto
  await prisma.estadoProyecto.createMany({
    data: [
      { estado: "Planificación" },
      { estado: "En progreso" },
      { estado: "Finalizado" },
      { estado: "Cancelado" },
    ],
    skipDuplicates: true,
  });

  // Estado Tarea
  await prisma.estadoTarea.createMany({
    data: [
      { estado: "Pendiente" },
      { estado: "En progreso" },
      { estado: "Completada" },
      { estado: "Cancelada" },
    ],
    skipDuplicates: true,
  });

  // Prioridad
  await prisma.prioridad.createMany({
    data: [
      { nombre_prioridad: "Baja" },
      { nombre_prioridad: "Media" },
      { nombre_prioridad: "Alta" },
      { nombre_prioridad: "Crítica" },
    ],
    skipDuplicates: true,
  });

    // Empresas
  await prisma.empresa.createMany({
    data: [
      { nombre: "TechSolutions S.A." },
      { nombre: "Innovatech" },
      { nombre: "DataCorp" },
    ],
    skipDuplicates: true,
  });

  console.log("Seed completado ✅");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });