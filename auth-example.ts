/**
 * =================================================================================================
 * ตัวอย่างการแก้ไขปัญหา Circular Dependency ระหว่าง AuthModule และ UsersModule ใน NestJS
 * =================================================================================================
 *
 * ปัญหา:
 * 1. AuthModule ต้องการใช้ UsersService (จาก UsersModule) เพื่อตรวจสอบข้อมูลผู้ใช้
 * 2. UsersModule ต้องการใช้ AuthService (จาก AuthModule) ในอนาคต (สมมติ) หรือมีการ import กันไปมา
 *    ทำให้เกิดการพึ่งพากันเป็นวงกลม (A -> B -> A) ซึ่ง NestJS ไม่สามารถจัดการลำดับการสร้างโมดูลได้
 *
 * วิธีแก้ไข:
 * ใช้ `forwardRef()` เพื่อบอกให้ NestJS ทราบว่าโมดูลหรือ Provider ที่กำลังจะ import นั้น
 * จะถูก resolve ในภายหลัง ทำให้ NestJS สามารถสร้าง Dependency Graph ได้สำเร็จ
 *
 * หลักการสำคัญ:
 * 1.  ใช้ `forwardRef()` ที่ "ปลายทาง" ของการ import ทั้งสองฝั่งใน `@Module` decorator
 *     - `AuthModule` imports `forwardRef(() => UsersModule)`
 *     - `UsersModule` imports `forwardRef(() => AuthModule)`
 * 2.  ใช้ `@Inject(forwardRef(() => Service))` ใน Constructor ของ "Service" ที่เป็นฝ่ายเริ่มต้นวงจร
 *     - ในกรณีนี้ `AuthService` ต้องการ `UsersService` เราจึงต้อง Inject `UsersService` ด้วย `forwardRef`
 *     - `UsersService` ไม่ได้ต้องการ `AuthService` จึงไม่จำเป็นต้องทำอะไร
 * 3.  `PrismaModule` ควรถูก import, provide และ export `PrismaService` แค่ที่เดียว และโมดูลอื่น
 *     ที่ต้องการใช้ `PrismaService` ก็แค่ import `PrismaModule` เข้ามาก็พอ ไม่ต้องใส่ `PrismaService`
 *     ใน `providers` ของตัวเองอีก
 * 4.  ใน `AppModule` ควร import ทั้ง `AuthModule` และ `UsersModule` เพื่อให้ NestJS รู้จักโมดูลทั้งสอง
 *     อย่างชัดเจน ไม่ควรซ่อนการ import `UsersModule` ไว้ใน `AuthModule` เพียงอย่างเดียว
 */

import {
  Module,
  Injectable,
  Controller,
  forwardRef,
  Inject,
  Global,
} from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

// =========================== MOCK PRISMA ===========================
// สร้าง Mock Service และ Module สำหรับ Prisma เพื่อให้โค้ดสมบูรณ์

@Injectable()
class MockPrismaService {}

@Global() // ทำให้ PrismaService พร้อมใช้งานในทุกโมดูลโดยไม่ต้อง import PrismaModule ทุกครั้ง
@Module({
  providers: [MockPrismaService],
  exports: [MockPrismaService],
})
class MockPrismaModule {}

// =========================== USERS ===========================

@Injectable()
class ExampleUsersService {
  // UsersService ไม่ได้ inject AuthService จึงไม่ต้องใช้ forwardRef
  constructor(private prisma: MockPrismaService) {}

  async findOne(email: string): Promise<any> {
    console.log(`Searching for user with email: ${email}`);
    return { id: 1, email, password: 'hashed_password' };
  }
}

@Module({
  imports: [
    // เราต้องการใช้ AuthService ในอนาคต (สมมติ) จึงต้องใช้ forwardRef
    forwardRef(() => ExampleAuthModule),
    // ไม่จำเป็นต้อง import MockPrismaModule ถ้ามันเป็น @Global
  ],
  providers: [ExampleUsersService],
  exports: [ExampleUsersService], // ต้อง export เพื่อให้ AuthModule นำไปใช้ได้
})
class ExampleUsersModule {}

// =========================== AUTH ===========================

@Injectable()
class ExampleAuthService {
  constructor(
    // นี่คือจุดที่สำคัญ: Inject UsersService ด้วย forwardRef
    // เพราะ AuthService ถูกสร้างก่อน แต่ต้องการ UsersService ที่อยู่ในโมดูลที่จะถูกสร้างทีหลัง
    @Inject(forwardRef(() => ExampleUsersService))
    private usersService: ExampleUsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(email);
    if (user && user.password === pass) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }
}

@Module({
  imports: [
    // AuthModule ต้องการ UsersService จาก UsersModule จึงต้องใช้ forwardRef
    forwardRef(() => ExampleUsersModule),
    PassportModule,
    JwtModule.register({ secret: 'SECRET_KEY', signOptions: { expiresIn: '60s' } }),
  ],
  providers: [ExampleAuthService],
  exports: [ExampleAuthService],
})
class ExampleAuthModule {}

// =========================== APP MODULE (Root) ===========================

@Module({
  imports: [
    // Import ทั้งสองโมดูลที่ระดับบนสุด
    ExampleAuthModule,
    ExampleUsersModule,
    MockPrismaModule, // Import PrismaModule ที่นี่
  ],
})
class ExampleAppModule {}
