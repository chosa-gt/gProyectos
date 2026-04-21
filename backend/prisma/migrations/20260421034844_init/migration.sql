-- CreateTable
CREATE TABLE "rol" (
    "id_rol" SERIAL NOT NULL,
    "nombre" VARCHAR(50),

    CONSTRAINT "rol_pkey" PRIMARY KEY ("id_rol")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id_usuario" SERIAL NOT NULL,
    "nombre" VARCHAR(50),
    "apellido" VARCHAR(50),
    "correo" VARCHAR(100) NOT NULL,
    "contrasena" VARCHAR(255) NOT NULL,
    "id_rol" INTEGER NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id_usuario")
);

-- CreateTable
CREATE TABLE "empresa" (
    "id_empresa" SERIAL NOT NULL,
    "nombre" VARCHAR(100),

    CONSTRAINT "empresa_pkey" PRIMARY KEY ("id_empresa")
);

-- CreateTable
CREATE TABLE "estado_cliente" (
    "id_estado_cliente" SERIAL NOT NULL,
    "estado" VARCHAR(50),

    CONSTRAINT "estado_cliente_pkey" PRIMARY KEY ("id_estado_cliente")
);

-- CreateTable
CREATE TABLE "clientes" (
    "id_cliente" SERIAL NOT NULL,
    "nombre" VARCHAR(100),
    "correo" VARCHAR(100),
    "telefono" VARCHAR(50),
    "id_empresa" INTEGER NOT NULL,
    "id_estado_cliente" INTEGER NOT NULL,

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id_cliente")
);

-- CreateTable
CREATE TABLE "estado_proyecto" (
    "id_estado_proyecto" SERIAL NOT NULL,
    "estado" VARCHAR(50),

    CONSTRAINT "estado_proyecto_pkey" PRIMARY KEY ("id_estado_proyecto")
);

-- CreateTable
CREATE TABLE "proyectos" (
    "id_proyecto" SERIAL NOT NULL,
    "nombre" VARCHAR(50),
    "descripcion" TEXT,
    "fecha_inicio" DATE NOT NULL,
    "fecha_fin" DATE,
    "id_cliente" INTEGER NOT NULL,
    "id_estado_proyecto" INTEGER NOT NULL,

    CONSTRAINT "proyectos_pkey" PRIMARY KEY ("id_proyecto")
);

-- CreateTable
CREATE TABLE "prioridad" (
    "id_prioridad" SERIAL NOT NULL,
    "nombre_prioridad" VARCHAR(50),

    CONSTRAINT "prioridad_pkey" PRIMARY KEY ("id_prioridad")
);

-- CreateTable
CREATE TABLE "estado_tarea" (
    "id_estado_tarea" SERIAL NOT NULL,
    "estado" VARCHAR(50),

    CONSTRAINT "estado_tarea_pkey" PRIMARY KEY ("id_estado_tarea")
);

-- CreateTable
CREATE TABLE "tareas" (
    "id_tarea" SERIAL NOT NULL,
    "tarea" VARCHAR(50),
    "descripcion" TEXT,
    "fecha_inicio" DATE NOT NULL,
    "fecha_fin" DATE,
    "id_proyecto" INTEGER NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "id_prioridad" INTEGER NOT NULL,
    "id_estado_tarea" INTEGER NOT NULL,

    CONSTRAINT "tareas_pkey" PRIMARY KEY ("id_tarea")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_correo_key" ON "usuarios"("correo");

-- CreateIndex
CREATE UNIQUE INDEX "clientes_correo_key" ON "clientes"("correo");

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_id_rol_fkey" FOREIGN KEY ("id_rol") REFERENCES "rol"("id_rol") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clientes" ADD CONSTRAINT "clientes_id_empresa_fkey" FOREIGN KEY ("id_empresa") REFERENCES "empresa"("id_empresa") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clientes" ADD CONSTRAINT "clientes_id_estado_cliente_fkey" FOREIGN KEY ("id_estado_cliente") REFERENCES "estado_cliente"("id_estado_cliente") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proyectos" ADD CONSTRAINT "proyectos_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "clientes"("id_cliente") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proyectos" ADD CONSTRAINT "proyectos_id_estado_proyecto_fkey" FOREIGN KEY ("id_estado_proyecto") REFERENCES "estado_proyecto"("id_estado_proyecto") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tareas" ADD CONSTRAINT "tareas_id_proyecto_fkey" FOREIGN KEY ("id_proyecto") REFERENCES "proyectos"("id_proyecto") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tareas" ADD CONSTRAINT "tareas_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuarios"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tareas" ADD CONSTRAINT "tareas_id_prioridad_fkey" FOREIGN KEY ("id_prioridad") REFERENCES "prioridad"("id_prioridad") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tareas" ADD CONSTRAINT "tareas_id_estado_tarea_fkey" FOREIGN KEY ("id_estado_tarea") REFERENCES "estado_tarea"("id_estado_tarea") ON DELETE RESTRICT ON UPDATE CASCADE;
