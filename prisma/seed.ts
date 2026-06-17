import { prisma } from '../src/lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  const usersToSeed = [
    {
      email: 'admin@gmail.com',
      name: 'Administrator',
      role: 'ADMIN',
      department: 'Management',
    },
    {
      email: 'agent@gmail.com',
      name: 'Support Agent',
      role: 'AGENT',
      department: 'Technical Support',
    },
    {
      email: 'user@gmail.com',
      name: 'Test Customer',
      role: 'USER',
      department: null,
    }
  ];

  const passwordHash = await bcrypt.hash('admin123', 10);

  for (const user of usersToSeed) {
    const existing = await prisma.user.findUnique({
      where: { email: user.email },
    });

    if (!existing) {
      await prisma.user.create({
        data: {
          ...user,
          passwordHash,
          status: 'ONLINE',
        } as any,
      });
      console.log(`Created ${user.role.toLowerCase()} user: ${user.email} / admin123`);
    } else {
      console.log(`${user.role} user already exists.`);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
