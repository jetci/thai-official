import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

export async function main(prisma: PrismaClient) {
  const email = 'admin@example.com';
  const newPassword = 'password';

  // Hash the new password
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

  // Update the user's password
  try {
    const updatedUser = await prisma.user.update({
      where: { email: email },
      data: { password: hashedPassword },
    });
    console.log(`Successfully updated password for user: ${updatedUser.email}`);
  } catch (error) {
    console.error(`Error updating password for ${email}:`, error);
    console.log(`This likely means the user '${email}' does not exist in the database.`);
    console.log('Please check your seed data or create the user first.');
  }
}

// istanbul ignore next
async function run() {
  if (process.env.NODE_ENV !== 'test') {
    const prisma = new PrismaClient();
    try {
      await main(prisma);
    } catch (e) {
      console.error(e);
      process.exit(1);
    } finally {
      await prisma.$disconnect();
    }
  }
}

run();
