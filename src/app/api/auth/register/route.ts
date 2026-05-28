import type { NextRequest } from "next/server";

import { registerController } from "@/controllers/auth.controller";

export async function POST(req: NextRequest) {
  return registerController(req);
}

