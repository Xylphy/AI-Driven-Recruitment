import z from "zod";
import { JOB_LOCATIONS } from "../constants";
import { identifiableTitleSchema } from "./common";
export const jobListingSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(255, "Title must be less than 255 characters"),
  qualifications: z.array(identifiableTitleSchema).optional(),
  requirements: z.array(identifiableTitleSchema).optional(),
  tags: z
    .array(
      z.object({
        title: z
          .string()
          .min(1, "Tag cannot be empty")
          .max(50, "Tag must be less than 50 characters"),
      }),
    )
    .optional(),
  location: z.enum(JOB_LOCATIONS),
  isFullTime: z.boolean(),
  hrOfficerId: z.string().optional(),
});
