import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { AUTH_COOKIE_NAME, verifyJwtToken } from "@/services/auth.service";

const profileSelect = { id: true, name: true, email: true, avatar: true } as const;

async function getAuthenticatedUser(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const payload = verifyJwtToken(token);
    return prisma.user.findUnique({ where: { id: payload.userId }, select: profileSelect });
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  return user
    ? NextResponse.json({ user })
    : NextResponse.json({ error: "Not authenticated" }, { status: 401 });
}

export async function PUT(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await request.json();
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const avatar = body.avatar === null || typeof body.avatar === "string" ? body.avatar : undefined;

  if (!name || name.length > 100 || avatar === undefined || (typeof avatar === "string" && avatar.length > 5_000_000)) {
    return NextResponse.json({ error: "Invalid profile data" }, { status: 400 });
  }

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: { name, avatar },
    select: profileSelect,
  });
  return NextResponse.json({ user: updatedUser });
}