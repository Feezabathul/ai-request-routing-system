import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { ZodError, z } from "zod";

import { prisma } from "@/lib/prisma";
import { RequestPriority, RequestStatus } from "@/generated/prisma";
import { createRequestController, getAllRequestsController } from "@/controllers/request.controller";

type JsonSuccess<T> = { success: true; data: T };
type JsonError = { success: false; error: { message: string; code: string } };

const jsonSuccess = <T,>(data: T, status = 200) =>
  NextResponse.json({ success: true, data } satisfies JsonSuccess<T>, { status });

const jsonError = (message: string, status = 400, code = "BAD_REQUEST") =>
  NextResponse.json({ success: false, error: { message, code } } satisfies JsonError, { status });

const listQuerySchema = z.object({
  status: z.nativeEnum(RequestStatus).optional(),
  priority: z.nativeEnum(RequestPriority).optional(),
  assignedAgentId: z.string().uuid().optional(),
  take: z.coerce.number().int().min(1).max(100).optional(),
  skip: z.coerce.number().int().min(0).max(10_000).optional(),
});

export async function POST(req: NextRequest) {
  // Uses controller: validates, creates request, triggers async AI placeholder.
  return createRequestController(req);
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const parsed = listQuerySchema.parse({
      status: searchParams.get("status") ?? undefined,
      priority: searchParams.get("priority") ?? undefined,
      assignedAgentId: searchParams.get("assignedAgentId") ?? undefined,
      take: searchParams.get("take") ?? undefined,
      skip: searchParams.get("skip") ?? undefined,
    });

    // Delegate list logic to controller when possible.
    // Controller currently supports status/priority/take/skip.
    if (!parsed.assignedAgentId) {
      return getAllRequestsController(req);
    }

    // assignedAgentId filtering is currently not exposed by the controller/service.
    // Keep route logic minimal and standardized.
    const requests = await prisma.customerRequest.findMany({
      where: {
        ...(parsed.status ? { status: parsed.status } : {}),
        ...(parsed.priority ? { priority: parsed.priority } : {}),
        assignedToId: parsed.assignedAgentId,
      },
      take: parsed.take ?? 50,
      skip: parsed.skip ?? 0,
      orderBy: { createdAt: "desc" },
      include: { assignedTo: true, createdBy: true },
    });

    return jsonSuccess({ requests }, 200);
  } catch (err) {
    if (err instanceof ZodError) {
      const message = err.issues[0]?.message ?? "Invalid request";
      return jsonError(message, 400, "VALIDATION_ERROR");
    }
    return jsonError("Internal server error", 500, "INTERNAL_SERVER_ERROR");
  }
}

