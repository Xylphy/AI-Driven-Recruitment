import { z } from "zod";
import { MONTHS } from "../constants";

export const dateRangeSchema = z.object({
  startMonth: z.enum(MONTHS),
  startYear: z.coerce.number(),
  endMonth: z
    .enum([...MONTHS, ""])
    .optional()
    .default(""),
  endYear: z.coerce.number().optional().default(0),
});

export const identifiableTitleSchema = z.object({
  id: z.string().or(z.number()),
  title: z.string(),
});
