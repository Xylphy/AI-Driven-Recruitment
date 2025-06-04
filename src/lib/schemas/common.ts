import { z } from "zod";
import { MONTHS } from "../constants";

export const dateRangeSchema = z.object({
  startMonth: z.enum(MONTHS),
  startYear: z.coerce.number(),
  endMonth: z.enum(MONTHS).optional(),
  endYear: z.coerce.number().optional(),
});

export const identifiableTitleSchema = z.object({
  id: z.string().or(z.number()),
  title: z.string(),
});
