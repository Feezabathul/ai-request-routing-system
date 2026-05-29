// src/repositories/note.repository.ts

import { prisma } from "../lib/prisma";
import { InternalNote } from "@/generated/prisma/client";

/**
 * Repository layer for internal notes.
 * Provides a thin wrapper around Prisma to keep business logic
 * separate from data access concerns.
 */
export const noteRepository = {
  /**
   * Create a new internal note.
   * @param params - Object containing requestId, authorId and note content.
   * @returns The created InternalNote record.
   */
  async create(params: {
    requestId: string;
    authorId: string;
    content: string;
  }): Promise<InternalNote> {
    return prisma.internalNote.create({
      data: {
        requestId: params.requestId,
        authorId: params.authorId,
        content: params.content,
      },
    });
  },
};
