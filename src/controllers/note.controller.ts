// src/controllers/note.controller.ts

import type { NextRequest } from "next/server";
import { addNote } from "@/services/note.service";
import { createNoteSchema } from "@/validations/note.schema";
import { z } from "zod";

/**
 * Handles creation of an internal note.
 * @param request - the incoming HTTP request (Next.js API route). The request
 *   body must contain a `content` field.
 * @param requestId - ID of the CustomerRequest (extracted from URL params).
 * @param authorId - ID of the authenticated user creating the note.
 * @returns the created note record.
 */
export async function createNoteController(params: {
  request: NextRequest;
  requestId: string;
  authorId: string;
}) {
  const { request, requestId, authorId } = params;
  const json = await request.json();

  // Validate payload
  const parsed = createNoteSchema.safeParse(json);
  if (!parsed.success) {
    const errors = parsed.error.format();
    const err = new Error("Invalid note payload");
    // Attach validation details for downstream handling
    (err as any).details = errors;
    (err as any).status = 400;
    throw err;
  }

  const { content } = parsed.data;

  const note = await addNote({ requestId, authorId, content });
  return note;
}
