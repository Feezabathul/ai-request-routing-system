import fs from "fs";
import path from "path";

const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, "utf8");
  envConfig.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      process.env[key] = val;
    }
  });
}

import { prisma } from "../src/lib/prisma";

async function testUserPasswords() {
  const users = await prisma.user.findMany();
  console.log("Found", users.length, "users:");
  for (const u of users) {
    console.log(`- Email: ${u.email}, Role: ${u.role}, Name: ${u.name}`);
  }
}

testUserPasswords().finally(() => prisma.$disconnect());
