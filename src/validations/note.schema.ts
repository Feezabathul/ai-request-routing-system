import { z } from 'zod';

export const createNoteSchema = z.object({
  content: z.string().min(1, { message: 'Content must not be empty' }),
  // internal notes are always internal; can extend later
});

export type CreateNoteInput = z.infer<typeof createNoteSchema>;
