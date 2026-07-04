-- CreateEnum
CREATE TYPE "RolUsuario" AS ENUM ('ADMIN', 'TUTOR');

-- DropForeignKey
ALTER TABLE "ninos" DROP CONSTRAINT "ninos_tutorId_fkey";

-- AlterTable
ALTER TABLE "ninos" ADD COLUMN     "activo" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "centroEducativoId" INTEGER,
ALTER COLUMN "tutorId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "tutores" ADD COLUMN     "usuarioId" INTEGER;

-- AlterTable
ALTER TABLE "zonas_monitoreo" ADD COLUMN     "centroEducativoId" INTEGER;

-- CreateTable
CREATE TABLE "usuarios" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "rol" "RolUsuario" NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "centros_educativos" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "direccion" TEXT,
    "telefono" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "centros_educativos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "codigos_afiliacion" (
    "id" SERIAL NOT NULL,
    "codigo" TEXT NOT NULL,
    "ninoId" INTEGER NOT NULL,
    "usado" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "codigos_afiliacion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "codigos_afiliacion_codigo_key" ON "codigos_afiliacion"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "tutores_usuarioId_key" ON "tutores"("usuarioId");

-- AddForeignKey
ALTER TABLE "tutores" ADD CONSTRAINT "tutores_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ninos" ADD CONSTRAINT "ninos_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES "tutores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ninos" ADD CONSTRAINT "ninos_centroEducativoId_fkey" FOREIGN KEY ("centroEducativoId") REFERENCES "centros_educativos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "codigos_afiliacion" ADD CONSTRAINT "codigos_afiliacion_ninoId_fkey" FOREIGN KEY ("ninoId") REFERENCES "ninos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "zonas_monitoreo" ADD CONSTRAINT "zonas_monitoreo_centroEducativoId_fkey" FOREIGN KEY ("centroEducativoId") REFERENCES "centros_educativos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

