import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log(`Start seeding ...`);

  // Seed Admin User
  const saltRounds = 10;
  const password = process.env.ADMIN_PASSWORD || 'password123';
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {
      password: hashedPassword,
    },
    create: {
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'ADMIN',
      profile: {
        create: {
          firstName: 'Admin',
          lastName: 'User',
        },
      },
    },
  });

  console.log(`Upserted admin user: admin@example.com`);

  // Seed Subjects
  const subjects = [
    { name: 'ความสามารถในการคิดวิเคราะห์', description: 'ทดสอบความสามารถในการคิดวิเคราะห์' },
    { name: 'ภาษาอังกฤษ', description: 'ทดสอบทักษะภาษาอังกฤษ' },
    { name: 'ความรู้และลักษณะการเป็นข้าราชการที่ดี', description: 'ทดสอบความเข้าใจในหลักการเป็นข้าราชการ' },
  ];

  for (const subject of subjects) {
    await prisma.subject.upsert({
      where: { name: subject.name },
      update: {},
      create: subject,
    });
    console.log(`Upserted subject: ${subject.name}`);
  }

  // Seed Positions
  const positions = [
    { name: 'นักวิเคราะห์นโยบายและแผน', description: 'ตำแหน่งสำหรับวิเคราะห์นโยบาย' },
    { name: 'นักทรัพยากรบุคคล', description: 'ตำแหน่งสำหรับบริหารงานบุคคล' },
    { name: 'นิติกร', description: 'ตำแหน่งสำหรับงานด้านกฎหมาย' },
  ];

  for (const position of positions) {
    await prisma.position.upsert({
      where: { name: position.name },
      update: {},
      create: position,
    });
    console.log(`Upserted position: ${position.name}`);
  }

  console.log(`Seeding finished.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });