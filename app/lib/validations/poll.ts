import { z } from "zod";

export const pollSchema = z.object({
  id: z.string().uuid(),
  question: z.string(),
  created_by: z.string().uuid(),
  created_at: z.string().datetime(),
});

export const pollOptionSchema = z.object({
  id: z.string().uuid(),
  poll_id: z.string().uuid(),
  option_text: z.string(),
  votes: z.number().int().default(0),
});

export const voteSchema = z.object({
  id: z.string().uuid(),
  poll_id: z.string().uuid(),
  option_id: z.string().uuid(),
  user_id: z.string().uuid(),
});
