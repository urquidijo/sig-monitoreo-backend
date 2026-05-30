CREATE EXTENSION IF NOT EXISTS postgis;
-- CreateEnum
CREATE TYPE "EstadoAlerta" AS ENUM ('NORMAL', 'FUERA_AREA');

-- CreateTable
CREATE TABLE "tutores" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "telefono" TEXT,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tutores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ninos" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "edad" INTEGER,
    "tutorId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ninos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "zonas_monitoreo" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "geom" geometry(Polygon, 4326),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "zonas_monitoreo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "posiciones_nino" (
    "id" SERIAL NOT NULL,
    "ninoId" INTEGER NOT NULL,
    "latitud" DOUBLE PRECISION NOT NULL,
    "longitud" DOUBLE PRECISION NOT NULL,
    "dentroArea" BOOLEAN NOT NULL DEFAULT true,
    "geom" geometry(Point, 4326),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "posiciones_nino_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alertas" (
    "id" SERIAL NOT NULL,
    "ninoId" INTEGER NOT NULL,
    "estado" "EstadoAlerta" NOT NULL,
    "mensaje" TEXT NOT NULL,
    "latitud" DOUBLE PRECISION NOT NULL,
    "longitud" DOUBLE PRECISION NOT NULL,
    "atendida" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "alertas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tutores_email_key" ON "tutores"("email");

-- AddForeignKey
ALTER TABLE "ninos" ADD CONSTRAINT "ninos_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES "tutores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posiciones_nino" ADD CONSTRAINT "posiciones_nino_ninoId_fkey" FOREIGN KEY ("ninoId") REFERENCES "ninos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alertas" ADD CONSTRAINT "alertas_ninoId_fkey" FOREIGN KEY ("ninoId") REFERENCES "ninos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE INDEX IF NOT EXISTS zonas_monitoreo_geom_idx
ON zonas_monitoreo
USING GIST (geom);

CREATE INDEX IF NOT EXISTS posiciones_nino_geom_idx
ON posiciones_nino
USING GIST (geom);