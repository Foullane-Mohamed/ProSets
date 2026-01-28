import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create an admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@prossets.com' },
    update: {},
    create: {
      email: 'admin@prossets.com',
      name: 'Admin User',
      password: '$2b$10$YourHashedPasswordHere', // This is just a placeholder for seeding
      role: Role.ADMIN,
    },
  });

  console.log('✅ Admin user created:', admin);
  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
