# feat(db): add db safety constraints with pg_catalog-guarded indexes + integration tests (Windows-friendly)

## สรุปการเปลี่ยนแปลง
- เพิ่มมิเกรชัน `20250819_db_safety_constraints` ใช้บล็อก `DO $$ … END $$;` ตรวจ `pg_catalog` (ล็อก `n.nspname='public'`, `i.indisunique=true`, และ `pg_get_indexdef(ix.oid) ILIKE '%("userId")%' / '%("jti")%'`) เพื่อป้องกันการสร้าง unique index ซ้ำ ก่อนสร้าง:
  - `subscription_user_ux` บน `"Subscription"("userId")`
  - `refresh_token_jti_ux` บน `"RefreshToken"("jti")`
- ขยาย Integration Tests (Testcontainers):
  - Functional unique `LOWER(email)`: insert + update อีเมลต่าง case → Prisma `P2002`
  - One-to-one: `Subscription.userId` ซ้ำ → `P2002`
  - `RefreshToken.jti` ซ้ำ → `P2002`
  - ON DELETE CASCADE: ลบ `User` แล้ว `RefreshToken` ของผู้ใช้นั้นถูกลบทั้งหมด
  - Guard ดัชนีซ้ำ: นับ unique index “เทียบเท่า” ใน `pg_catalog` ต้อง = 1 สำหรับทั้งสองดัชนี
- ปรับสคริปต์ Jest ให้ Windows-friendly: `--testMatch "**/*.int-spec.ts" --runInBand --detectOpenHandles --testTimeout=60000`

## เหตุผลทางสถาปัตยกรรม
- บังคับความถูกต้องระดับฐานข้อมูล, ป้องกันดัชนีซ้ำซ้อนที่ทำให้ write ช้าลง/ใช้ I/O เกินจำเป็น, ลดความเสี่ยง regression ด้าน Auth/Subscriptions/Refresh Token

## ผลการทดสอบ (แนบไฟล์ log)
- `logs/npm-install.log`
- `logs/test-int.transcript.log` (รันด้วย PowerShell Start-Transcript)
- สรุปผลคาดหวัง: เคสทั้งหมดผ่าน (insert/update email → `P2002`, sub>1 → `P2002`, jti ซ้ำ → `P2002`, cascade delete ผ่าน, index-count=1 ผ่าน)

## คำสั่ง Rollback (เฉพาะดัชนีที่ PR นี้สร้าง)
```
DROP INDEX IF EXISTS public.subscription_user_ux;
DROP INDEX IF EXISTS public.refresh_token_jti_ux;
```

หมายเหตุ: ไม่แตะ functional unique เดิมบน `LOWER(email)` ที่มีอยู่แล้ว

## ผลกระทบ/ความเสี่ยง
- Migration ทำงานในทรานแซกชัน (ไม่มี CONCURRENTLY), ปลอดภัยต่อ chain เดิม
- หากพบดัชนีซ้ำจากสภาพแวดล้อมเก่า บล็อก `DO $$` จะกันไม่ให้สร้างซ้ำ

## เช็กลิสต์ DoD (ต้องผ่าน)
- [x] Migration ใหม่เท่านั้น; ไม่แก้ไฟล์ migration เดิม
- [x] DO-block ตรวจ `pg_catalog` ครบ (public schema, `indisunique=true`, `ILIKE` คอลัมน์เป้าหมาย)
- [x] ใช้ `prisma migrate deploy`
- [x] Integration tests ครบทุกเคส + ตรวจ index-count = 1
- [x] สคริปต์ Jest Windows-friendly + timeout
- [x] แนบ log migrate + tests
- [x] ระบุ rollback steps ชัดเจน
