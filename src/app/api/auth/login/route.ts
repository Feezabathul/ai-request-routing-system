import type { NextRequest } from "next/server";

import { loginController } from "@/controllers/auth.controller";

export async function POST(req: NextRequest) {
  return loginController(req);
}

