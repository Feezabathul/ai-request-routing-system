import { NextResponse, type NextRequest } from "next/server";
import { ZodError } from "zod";

import {
  RequestServiceError,
  assignAgentToRequest,
  createRequest,
  getAllRequests,
  getRequestById,
  updateRequestStatus,
} from "@/services/request.service";

type JsonSuccess<T> = { success: true; data: T };
type JsonError = { success: false; error: { message: string; code: string } };

const jsonSuccess = <T,>(data: T, status = 200) =>
  NextResponse.json({ success: true, data } satisfies JsonSuccess<T>, { status });

const jsonError = (message: string, status = 400, code = "BAD_REQUEST") =>
  NextResponse.json({ success: false, error: { message, code } } satisfies JsonError, { status });

const handleControllerError = (err: unknown) => {
  if (err instanceof RequestServiceError) {
    const code =
      err.statusCode === 404
        ? "NOT_FOUND"
        : err.statusCode === 401
          ? "UNAUTHORIZED"
          : err.statusCode === 403
            ? "FORBIDDEN"
            : "BAD_REQUEST";
    return jsonError(err.message, err.statusCode, code);
  }

  if (err instanceof ZodError) {
    const message = err.issues[0]?.message ?? "Invalid request";
    return jsonError(message, 400, "VALIDATION_ERROR");
  }

  return jsonError("Internal server error", 500, "INTERNAL_SERVER_ERROR");
};

export const createRequestController = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const request = await createRequest(body);
    return jsonSuccess({ request }, 201);
  } catch (err) {
    return handleControllerError(err);
  }
};

export const getRequestByIdController = async (_req: NextRequest, requestId: string) => {
  try {
    const request = await getRequestById({ id: requestId });
    return jsonSuccess({ request }, 200);
  } catch (err) {
    return handleControllerError(err);
  }
};

export const getAllRequestsController = async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const requests = await getAllRequests({
      status: searchParams.get("status") ?? undefined,
      priority: searchParams.get("priority") ?? undefined,
      take: searchParams.get("take") ?? undefined,
      skip: searchParams.get("skip") ?? undefined,
    });
    return jsonSuccess({ requests }, 200);
  } catch (err) {
    return handleControllerError(err);
  }
};

export const updateRequestStatusController = async (
  req: NextRequest,
  requestId: string,
) => {
  try {
    const body = await req.json();
    const request = await updateRequestStatus(requestId, body);
    return jsonSuccess({ request }, 200);
  } catch (err) {
    return handleControllerError(err);
  }
};

export const assignAgentToRequestController = async (req: NextRequest, requestId: string) => {
  try {
    const body = await req.json();
    const request = await assignAgentToRequest(requestId, body);
    return jsonSuccess({ request }, 200);
  } catch (err) {
    return handleControllerError(err);
  }
};

