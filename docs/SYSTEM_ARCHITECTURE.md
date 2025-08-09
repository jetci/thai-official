# เอกสารสถาปัตยกรรมระบบ (System Architecture Document)

**โครงการ:** Thai Official Prep API
**วันที่จัดทำ:** 9 สิงหาคม 2568

---

## 1. ภาพรวม (Overview)

เอกสารนี้อธิบายสถาปัตยกรรมของระบบ **Thai Official Prep API** ซึ่งเป็น Backend API สำหรับแอปพลิเคชันเตรียมสอบข้าราชการ ทำหน้าที่เป็นศูนย์กลางในการจัดการข้อมูลทั้งหมด เช่น ผู้ใช้งาน, คลังคำถาม, หมวดหมู่วิชา, และประกาศต่างๆ ระบบถูกออกแบบมาให้มีความยืดหยุ่น (Scalable) และง่ายต่อการบำรุงรักษา (Maintainable) เพื่อรองรับการขยายฟีเจอร์ในอนาคต

## 2. เทคโนโลยีที่ใช้ (Technology Stack)

- **Backend Framework:** NestJS (v10.x) on Node.js (v20.x)
- **Language:** TypeScript (v5.x)
- **Database ORM:** Prisma (v5.x)
- **Database:** PostgreSQL
- **Authentication:** Passport.js with JWT Strategy
- **API Specification:** OpenAPI (Swagger)
- **Testing:** Jest

## 3. สถาปัตยกรรมและการทำงาน (API Architecture Flow)

ระบบใช้สถาปัตยกรรมแบบ **Modular** และทำงานแบบ **API-driven**:

1.  **Client (Frontend/Mobile)** ส่ง `HTTP Request` มายัง API Gateway
2.  **NestJS Controller** รับ Request และทำการตรวจสอบข้อมูลเบื้องต้นผ่าน `DTOs` และ `Pipes`
3.  **Authentication Guard** (ใช้ Passport.js) ตรวจสอบ `JWT` ใน Header เพื่อยืนยันตัวตน
4.  **Roles Guard** ตรวจสอบสิทธิ์การเข้าถึงของผู้ใช้ (RBAC) ตาม `Role` ที่กำหนด (USER, ADMIN)
5.  **Service** ทำการประมวลผล Business Logic
6.  **Prisma Service** ติดต่อกับฐานข้อมูล PostgreSQL เพื่อดำเนินการ CRUD
7.  **Service** ส่งผลลัพธ์กลับไปให้ **Controller**
8.  **Controller** ส่ง `HTTP Response` (ในรูปแบบ JSON) กลับไปยัง Client

## 4. รายละเอียดโมดูล (Module Descriptions)

- **Users:** จัดการข้อมูลโปรไฟล์ผู้ใช้งาน
- **Auth:** จัดการการลงทะเบียน, เข้าสู่ระบบ, และการออก JWT
- **Questions:** จัดการคลังคำถาม, ตัวเลือก, และเฉลย
- **Subjects:** จัดการหมวดหมู่วิชาของคำถาม
- **Positions:** จัดการตำแหน่งงานที่เกี่ยวข้องกับเนื้อหา
- **Announcements:** จัดการประกาศและข่าวสาร
- **Subscriptions:** จัดการแพ็คเกจการใช้งานของผู้ใช้ (Free/Premium)

## 5. โครงสร้างฐานข้อมูล (Database Schema)

(ข้อมูลจาก `prisma/schema.prisma`)

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  role      Role     @default(USER)
  profile   Profile?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Profile {
  id        String  @id @default(cuid())
  firstName String?
  lastName  String?
  user      User    @relation(fields: [userId], references: [id])
  userId    String  @unique
}

model Subject {
  id          String     @id @default(cuid())
  name        String     @unique
  description String?
  questions   Question[]
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
}

model Question {
  id        String   @id @default(cuid())
  title     String
  content   String?
  subject   Subject  @relation(fields: [subjectId], references: [id])
  subjectId String
  choices   Choice[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Choice {
  id         String   @id @default(cuid())
  text       String
  isCorrect  Boolean  @default(false)
  question   Question @relation(fields: [questionId], references: [id])
  questionId String
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}

model Announcement {
  id        String   @id @default(cuid())
  title     String
  content   String
  published Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Position {
  id          String   @id @default(cuid())
  name        String   @unique
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Subscription {
  id        String    @id @default(cuid())
  userId    String
  plan      String // e.g., 'FREE', 'PREMIUM'
  status    String // e.g., 'ACTIVE', 'CANCELED'
  startDate DateTime
  endDate   DateTime?
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
}

enum Role {
  USER
  ADMIN
}
```

## 6. กลไกความปลอดภัย (Security Mechanisms)

- **JWT Authentication:** ใช้ `access_token` ที่มีวันหมดอายุสั้น (short-lived) สำหรับการเข้าถึง API
- **RBAC (Role-Based Access Control):** ใช้ `@Roles` decorator ร่วมกับ `RolesGuard` เพื่อจำกัดการเข้าถึง endpoint เฉพาะสำหรับ `ADMIN`
- **Password Hashing:** ใช้ `bcrypt` ในการ hash รหัสผ่านก่อนบันทึกลงฐานข้อมูล
- **Input Validation:** ใช้ `class-validator` และ `ValidationPipe` ในการตรวจสอบความถูกต้องของข้อมูล (DTOs) ที่เข้ามา

## 7. มาตรฐาน API (API Standards)

- **Versioning:** `/api/v1/...` (ยังไม่ได้ implement)
- **Error Format:**
  ```json
  {
    "statusCode": 400,
    "message": "Validation failed",
    "errors": ["email must be an email"]
  }
  ```
- **DTO Validation:** ทุก endpoint ที่มีการรับข้อมูล (POST, PUT, PATCH) ต้องมี Data Transfer Object (DTO) สำหรับ validation

## 8. Gap Analysis และความเสี่ยง

| โมดูล/ฟีเจอร์         | สถานะปัจจุบัน (มี/ไม่มี) | จุดที่ต้องพัฒนา/แก้ไข                                   | ระดับความเสี่ยง | แนวทางลดความเสี่ยง                                        |
| --------------------- | :---------------------: | ------------------------------------------------------ | :--------------: | --------------------------------------------------------- |
| **Auth**              |           มี            | - เพิ่ม Refresh Token strategy<br>- เขียน Unit/E2E tests |     **สูง**      | พัฒนา Refresh Token และเขียนเทสให้ครอบคลุม 100%           |
| **Questions**         |           มี            | - เพิ่มฟังก์ชัน `Update`<br>- เพิ่ม E2E tests สำหรับ Update |      ปานกลาง      | Implement `updateQuestion` และเพิ่ม Test Case ที่เกี่ยวข้อง |
| **Users**             |         ไม่มี          | - สร้าง CRUD endpoints ทั้งหมด<br>- เขียน Unit/E2E tests |     **สูง**      | พัฒนาเป็นลำดับแรกหลัง `Auth`                              |
| **Subjects**          |         ไม่มี          | - สร้าง CRUD endpoints ทั้งหมด<br>- เขียน Unit/E2E tests |      ปานกลาง      | พัฒนาพร้อมกับ `Questions` v2                            |
| **Positions**         |         ไม่มี          | - สร้าง CRUD endpoints ทั้งหมด<br>- เขียน Unit/E2E tests |      ปานกลาง      | พัฒนาพร้อมกับ `Questions` v2                            |
| **Announcements**     |         ไม่มี          | - สร้าง CRUD endpoints ทั้งหมด<br>- เขียน Unit/E2E tests |       ต่ำ        | พัฒนาในเฟสถัดไป                                           |
| **Subscriptions**     |         ไม่มี          | - สร้าง Logic จัดการ plan<br>- เชื่อมต่อ Payment Gateway |       ต่ำ        | พัฒนาในเฟสถัดไป                                           |
| **API Versioning**    |         ไม่มี          | - Implement global prefix `/api/v1`                    |      ปานกลาง      | ตั้งค่าใน `main.ts`                                       |
| **OpenAPI Spec**      |           มี            | - อัปเดตให้ตรงกับทุก endpoints และ DTOs                 |       ต่ำ        | Generate อัตโนมัติหลังการพัฒนาทุกครั้ง                     |

## 9. แผนการพัฒนา (Roadmap)

**Phase 1: Core Functionality & Security (เร่งด่วนสูงสุด)**
1.  **Auth Module:**
    -   [ ] Implement Refresh Token strategy.
    -   [ ] เขียน Unit Tests และ E2E Tests ให้ครอบคลุม 100%.
2.  **Users Module:**
    -   [ ] สร้าง CRUD endpoints สำหรับจัดการโปรไฟล์ผู้ใช้.
    -   [ ] เขียน Unit Tests และ E2E Tests.
3.  **API Versioning:**
    -   [ ] เพิ่ม `/api/v1` เป็น prefix สำหรับทุก routes.

**Phase 2: Content Management**
1.  **Questions Module:**
    -   [ ] Implement `updateQuestion` endpoint.
    -   [ ] เพิ่ม E2E Test สำหรับการ Update.
2.  **Subjects & Positions Modules:**
    -   [ ] สร้าง CRUD endpoints ทั้งหมด.
    -   [ ] เขียน Tests ที่จำเป็น.

**Phase 3: Feature Enhancement**
1.  **Announcements Module:**
    -   [ ] สร้าง CRUD endpoints.
2.  **OpenAPI/Swagger:**
    -   [ ] ตรวจสอบและอัปเดตเอกสารให้สมบูรณ์

---
