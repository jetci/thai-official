const { PrismaClient } = require('@prisma/client');

// instantiate PrismaClient
const prisma = new PrismaClient();

async function main() {
  // create two dummy announcements
  const post1 = await prisma.announcements.create({
    data: {
        title: 'รับสมัครนักวิเคราะห์นโยบายและแผนปฏิบัติการ',
        agency: 'สำนักงานคณะกรรมการข้าราชการพลเรือน (ก.พ.)',
        details: 'วุฒิปริญญาตรีทุกสาขา มีความสามารถในการคิดวิเคราะห์และนำเสนอ',
        application_start_date: new Date('2025-08-15T00:00:00.000Z'),
        application_end_date: new Date('2025-09-05T00:00:00.000Z'),
        official_link: 'https://job.ocsc.go.th'
    },
  });

  const post2 = await prisma.announcements.create({
    data: {
        title: 'รับสมัครนิติกรปฏิบัติการ',
        agency: 'กรมสรรพากร',
        details: 'วุฒิปริญญาตรี สาขานิติศาสตร์ สอบผ่านภาค ก. ของ ก.พ. แล้ว',
        application_start_date: new Date('2025-08-20T00:00:00.000Z'),
        application_end_date: new Date('2025-09-10T00:00:00.000Z'),
        official_link: 'https://www.rd.go.th/publish/28.html'
    },
  });

  console.log({ post1, post2 });
}

// execute the main function
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // close Prisma Client at the end
    await prisma.$disconnect();
  });
