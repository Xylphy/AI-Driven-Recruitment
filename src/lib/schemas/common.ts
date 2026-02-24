import { z } from "zod";

export const identifiableTitleSchema = z.object({
  id: z.string().or(z.number()),
  title: z.string(),
});
