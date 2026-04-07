import z from "zod";
import { JOB_LOCATIONS } from "../constants";
import { identifiableTitleSchema } from "./common";

const scoringSettingsSchema = z.object({
  // Behavioral Blend Weights
  softSkillsWeight: z.number().min(0).max(1).default(0.3),
  transcriptionWeight: z.number().min(0).max(1).default(0.25),
  culturalFitWeight: z.number().min(0).max(1).default(0.15),
  transcriptionCulturalFitWeight: z.number().min(0).max(1).default(0.3),

  // Predictive Success Weights
  jobFitWeight: z.number().min(0).max(1).default(0.4),
  behavioralBlendWeight: z.number().min(0).max(1).default(0.6),
  benchmark: z.number().min(0).max(1).default(0.8),

  // AI Benchmark
  aiBenchmark: z.number().min(0).max(1).default(0.8),
});

export const jobListingSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(255, "Title must be less than 255 characters"),
  qualifications: z.array(identifiableTitleSchema).optional(),
  requirements: z
    .array(identifiableTitleSchema)
    .min(1, "At least one requirement is required")
    .optional(),
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
  scoringSettings: scoringSettingsSchema,
});
