-- 1. Drop the default on User.role that references CUSTOMER
ALTER TABLE "User" ALTER COLUMN role DROP DEFAULT;

-- 2. Migrate any existing CUSTOMER users -> AGENT
UPDATE "User" SET role = 'AGENT'::"UserRole" WHERE role::text = 'CUSTOMER';
