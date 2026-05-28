// src/app/api/requests/[id]/notes/route.ts

import { NextResponse } from "next/server";
import { createNoteController } from "@/controllers/note.controller";

/**
 * POST /api/requests/[id]/notes
 * Creates an internal note for the given request.
 *
 * Expected body: { content: string }
 * Author (actor) is inferred from an authenticated session – for now we read a
 * custom header `x-user-id`. In a real production setup you would replace this
 * with your auth middleware that injects the user ID.
 */
export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    // Simple auth extraction (replace with proper auth in production)
    const authorId = request.headers.get("x-user-id");
    if (!authorId) {
      return NextResponse.json(
        { error: "Unauthenticated" },
        { status: 401 }
      );
    }

    const note = await createNoteController({
      request,
      requestId: params.id,
      authorId,
    });

    return NextResponse.json(note, { status: 201 });
  } catch (err: any) {
    const status = err.status ?? 500;
    const message = err.message ?? "Internal Server Error";
    // If validation errors were attached, include them in the response.
    const details = err.details ? { validation: err.details } : undefined;
    return NextResponse.json(
      { error: message, ...(details && { details }) },
      { status }
    );
  }
}
