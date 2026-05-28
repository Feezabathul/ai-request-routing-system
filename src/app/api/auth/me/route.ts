import type { NextRequest } from "next/server";

import { meController } from "@/controllers/auth.controller";

export async function GET(req: NextRequest) {
  return meController(req);
}

