-- CreateTable
CREATE TABLE "historial_proyecto" (
    "id_historial" SERIAL NOT NULL,
    "id_proyecto" INTEGER NOT NULL,
    "id_estado_proyecto" INTEGER NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "detalle" VARCHAR(500),
    "fecha_cambio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historial_proyecto_pkey" PRIMARY KEY ("id_historial")
);

-- AddForeignKey
ALTER TABLE "historial_proyecto" ADD CONSTRAINT "historial_proyecto_id_proyecto_fkey" FOREIGN KEY ("id_proyecto") REFERENCES "proyectos"("id_proyecto") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_proyecto" ADD CONSTRAINT "historial_proyecto_id_estado_proyecto_fkey" FOREIGN KEY ("id_estado_proyecto") REFERENCES "estado_proyecto"("id_estado_proyecto") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_proyecto" ADD CONSTRAINT "historial_proyecto_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuarios"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;
