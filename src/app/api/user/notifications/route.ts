import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { AUTH_COOKIE_NAME, verifyJwtToken } from "@/services/auth.service";

const visibleEventTypes = ["REQUEST_CREATED", "ASSIGNED", "STATUS_CHANGED"] as const;

export async function GET(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  try {
    const payload = verifyJwtToken(token);
    const events = await prisma.requestEvent.findMany({
      where: {
        eventType: { in: [...visibleEventTypes] },
        request: { createdById: payload.userId },
      },
      select: {
        id: true,
        eventType: true,
        description: true,
        metadata: true,
        createdAt: true,
        request: { select: { id: true, subject: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    const notifications = events.flatMap((event) => {
      const metadata = event.metadata && typeof event.metadata === "object" && !Array.isArray(event.metadata)
        ? event.metadata as Record<string, unknown>
        : {};
      const status = metadata.newStatus ?? metadata.status;

      if (event.eventType === "REQUEST_CREATED") {
        return [{ ...event, title: "Request submitted", message: `Your request '${event.request.subject}' was submitted.` }];
      }
      if (event.eventType === "ASSIGNED") {
        return [
          { ...event, title: "Agent assigned", message: `An agent has been assigned to '${event.request.subject}'.` },
          { ...event, id: `${event.id}-status`, title: "Request in progress", message: `Your request '${event.request.subject}' is now In Progress.` },
        ];
      }
      if (status === "IN_PROGRESS") {
        return [{ ...event, title: "Request in progress", message: `Your request '${event.request.subject}' is now In Progress.` }];
      }
      if (status === "RESOLVED") {
        return [{ ...event, title: "Request resolved", message: `Your request '${event.request.subject}' has been resolved.` }];
      }
      return [];
    });

    return NextResponse.json({ notifications });
  } catch (error) {
    console.error("Error fetching customer notifications:", error);
    return NextResponse.json({ error: "Unable to load notifications" }, { status: 500 });
  }
}