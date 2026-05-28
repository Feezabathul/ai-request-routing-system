import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { ZodError, z } from "zod";

import { prisma } from "@/lib/prisma";
import { RequestEventType, RequestPriority } from "@/generated/prisma";
import {
  assignAgentToRequestController,
  getRequestByIdController,
  updateRequestStatusController,
} from "@/controllers/request.controller";

type JsonSuccess<T> = { success: true; data: T };
type JsonError = { success: false; error: { message: string; code: string } };

const jsonSuccess = <T,>(data: T, status = 200) =>
  NextResponse.json({ success: true, data } satisfies JsonSuccess<T>, { status });

const jsonError = (message: string, status = 400, code = "BAD_REQUEST") =>
  NextResponse.json({ success: false, error: { message, code } } satisfies JsonError, { status });

const paramsSchema = z.object({
  id: z.string().uuid(),
});

const patchBodySchema = z
  .object({
    actorId: z.string().uuid().optional(),
    status: z.string().optional(), // validated by controller when used
    agentId: z.string().uuid().optional(),
    priority: z.nativeEnum(RequestPriority).optional(),
  })
  .refine((v) => v.status || v.agentId || v.priority, {
    message: "Provide at least one of status, agentId, or priority",
  });

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = paramsSchema.parse(await ctx.params);
    return getRequestByIdController(req, id);
  } catch (err) {
    if (err instanceof ZodError) {
      const message = err.issues[0]?.message ?? "Invalid request";
      return jsonError(message, 400, "VALIDATION_ERROR");
    }
    return jsonError("Internal server error", 500, "INTERNAL_SERVER_ERROR");
  }
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = paramsSchema.parse(await ctx.params);
    const body = patchBodySchema.parse(await req.json());

    // Delegate to controllers where functionality exists (status + assignment).
    if (body.status) {
      const statusRes = await updateRequestStatusController(
        new Request(req.url, {
          method: "PATCH",
          body: JSON.stringify({ status: body.status, actorId: body.actorId }),
          headers: { "content-type": "application/json" },
        }) as unknown as NextRequest,
        id,
      );
      if (!statusRes.ok) return statusRes;
    }

    if (body.agentId) {
      const assignRes = await assignAgentToRequestController(
        new Request(req.url, {
          method: "PATCH",
          body: JSON.stringify({ agentId: body.agentId, actorId: body.actorId }),
          headers: { "content-type": "application/json" },
        }) as unknown as NextRequest,
        id,
      );
      if (!assignRes.ok) return assignRes;
    }

    // Priority update + event placeholder (not yet exposed by controller/service).
    if (body.priority) {
      const updated = await prisma.customerRequest.update({
        where: { id },
        data: { priority: body.priority },
      });

      await prisma.requestEvent.create({
        data: {
          requestId: id,
          actorId: body.actorId,
          eventType: RequestEventType.PRIORITY_CHANGED,
          metadata: { priority: body.priority } as never,
        },
      });

      return jsonSuccess({ request: updated }, 200);
    }

    // If we got here, we only performed status/assignment updates and should return latest.
    const request = await prisma.customerRequest.findUnique({
      where: { id },
      include: {
        aiClassifications: { orderBy: { createdAt: "desc" } },
        internalNotes: { orderBy: { createdAt: "desc" } },
        requestEvents: { orderBy: { createdAt: "desc" } },
        assignedTo: true,
        createdBy: true,
      },
    });

    if (!request) return jsonError("Request not found", 404, "NOT_FOUND");
    return jsonSuccess({ request }, 200);
  } catch (err) {
    if (err instanceof ZodError) {
      const message = err.issues[0]?.message ?? "Invalid request";
      return jsonError(message, 400, "VALIDATION_ERROR");
    }
    return jsonError("Internal server error", 500, "INTERNAL_SERVER_ERROR");
  }
}

