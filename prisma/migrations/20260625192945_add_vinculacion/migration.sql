-- CreateTable
CREATE TABLE "codigos_vinculacion" (
    "id" SERIAL NOT NULL,
    "codigo" TEXT NOT NULL,
    "ninoId" INTEGER NOT NULL,
    "usado" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "codigos_vinculacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dispositivos" (
    "id" SERIAL NOT NULL,
    "ninoId" INTEGER NOT NULL,
    "token" TEXT NOT NULL,
    "plataforma" TEXT,
    "revocado" BOOLEAN NOT NULL DEFAULT false,
    "ultimaConexion" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dispositivos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "codigos_vinculacion_codigo_key" ON "codigos_vinculacion"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "dispositivos_token_key" ON "dispositivos"("token");

-- AddForeignKey
ALTER TABLE "codigos_vinculacion" ADD CONSTRAINT "codigos_vinculacion_ninoId_fkey" FOREIGN KEY ("ninoId") REFERENCES "ninos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dispositivos" ADD CONSTRAINT "dispositivos_ninoId_fkey" FOREIGN KEY ("ninoId") REFERENCES "ninos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
