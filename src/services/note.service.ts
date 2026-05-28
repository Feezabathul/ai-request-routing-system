// src/services/note.service.ts

import { noteRepository } from "@/repositories/note.repository";
import { logNoteAddedEvent } from "@/services/event.service";

/**
 * Service layer for internal notes.
 * Handles creation and event logging.
 */
export async function addNote(params: {
  requestId: string;
  authorId: string;
  content: string;
}) {
  const { requestId, authorId, content } = params;
  // Persist note
  const note = await noteRepository.create({ requestId, authorId, content });

  // Emit NOTE_ADDED event (actor is the author)
  await logNoteAddedEvent({
    requestId,
    actorId: authorId,
    noteId: note.id,
  });

  return note;
}
