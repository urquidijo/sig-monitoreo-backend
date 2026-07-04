import 'dotenv/config';
import * as bcrypt from 'bcryptjs';
import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL ?? 'admin@sig-monitoreo.com';
  const password = process.env.SEED_ADMIN_PASSWORD ?? 'Admin1234';

  const existente = await prisma.usuario.findUnique({ where: { email } });

  if (existente) {
    console.log(`El usuario admin "${email}" ya existe (id ${existente.id}).`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const admin = await prisma.usuario.create({
    data: {
      nombre: 'Administrador',
      email,
      passwordHash,
      rol: 'ADMIN',
    },
  });

  console.log(`Usuario admin creado: ${admin.email} (id ${admin.id})`);
  console.log(`Password: ${password}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
