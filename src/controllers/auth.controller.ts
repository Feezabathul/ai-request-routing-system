import { NextResponse, type NextRequest } from "next/server";
import { ZodError } from "zod";

import {
  AUTH_COOKIE_NAME,
  AuthServiceError,
  getUserById,
  loginUser,
  registerUser,
  verifyJwtToken,
} from "@/services/auth.service";

type JsonSuccess<T> = {
  success: true;
  data: T;
};

type JsonError = {
  success: false;
  error: {
    message: string;
    code: string;
  };
};

const jsonSuccess = <T,>(data: T, status = 200) => {
  return NextResponse.json({ success: true, data } satisfies JsonSuccess<T>, { status });
};

const jsonError = (message: string, status = 400, code = "BAD_REQUEST") => {
  return NextResponse.json({ success: false, error: { message, code } } satisfies JsonError, { status });
};

const handleControllerError = (err: unknown) => {
  console.error("Auth Controller Error:", err);

  if (
    err instanceof AuthServiceError ||
    (err && typeof err === "object" && ("statusCode" in err || (err as { name?: string }).name === "AuthServiceError"))
  ) {
    const authErr = err as { message?: string; statusCode?: number };
    const statusCode = authErr.statusCode || 400;
    const message = authErr.message || "Authentication error";
    const code =
      statusCode === 401
        ? "UNAUTHORIZED"
        : statusCode === 403
          ? "FORBIDDEN"
          : statusCode === 409
            ? "CONFLICT"
            : "BAD_REQUEST";
    return jsonError(message, statusCode, code);
  }

  if (err instanceof ZodError || (err && typeof err === "object" && (err as { name?: string }).name === "ZodError")) {
    const zodErr = err as ZodError;
    const message = zodErr.issues?.[0]?.message ?? "Invalid request";
    return jsonError(message, 400, "VALIDATION_ERROR");
  }

  return jsonError("Internal server error", 500, "INTERNAL_SERVER_ERROR");
};

const getTokenFromRequest = (req: NextRequest): string | null => {
  return req.cookies.get(AUTH_COOKIE_NAME)?.value ?? null;
};

export const registerController = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const result = await registerUser(body);

    const res = jsonSuccess({ user: result.user }, 201);
    res.cookies.set(result.cookie.name, result.cookie.value, result.cookie.options);
    return res;
  } catch (err) {
    return handleControllerError(err);
  }
};

export const loginController = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const result = await loginUser(body);

    const res = jsonSuccess({ user: result.user }, 200);
    res.cookies.set(result.cookie.name, result.cookie.value, result.cookie.options);
    return res;
  } catch (err) {
    return handleControllerError(err);
  }
};

export const meController = async (req: NextRequest) => {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return jsonError("Not authenticated", 401, "UNAUTHORIZED");

    const payload = verifyJwtToken(token);
    const user = await getUserById(payload.userId);
    if (!user) return jsonError("Not authenticated", 401, "UNAUTHORIZED");

    return jsonSuccess({ user }, 200);
  } catch (err) {
    return handleControllerError(err);
  }
};

