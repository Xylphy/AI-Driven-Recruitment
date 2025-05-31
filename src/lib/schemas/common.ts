import { z } from "zod";
import { MONTHS } from "../constants";

export const dateRangeSchema = z.object({
  startMonth: z.enum(MONTHS),
  startYear: z.number(),
  endMonth: z.enum(MONTHS).optional(),
  endYear: z.number().optional(),
});
