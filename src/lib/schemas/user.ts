import { z } from "zod";
import { dateRangeSchema } from "./common";

export const userSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.email("Invalid email address"),
  prefix: z.string().optional().default(""),
  mobileNumber: z.string(),
  countryCode: z.enum(["+63", "+1", "+44", "+91"]).optional().default("+1"),
  street: z.string().optional().default(""),
  zip: z.string().optional().default(""),
  country: z
    .enum(["PH", "US", "CA", "GB", "AU", "IN", ""])
    .optional()
    .default(""),
  city: z.string().optional().default(""),
  jobTitle: z.string().optional().default(""),
  educationalDetails: z
    .array(
      z.intersection(
        z.object({
          degree: z.string().optional().default(""),
          institute: z.string().optional().default(""),
          currentlyPursuing: z.boolean(),
          major: z.string().optional().default(""),
        }),
        dateRangeSchema
      )
    )
    .optional()
    .default([]),
  socialLinks: z
    .array(
      z.object({
        value: z.url("Invalid URL"),
      })
    )
    .optional()
    .default([]),
  jobExperiences: z
    .array(
      z.intersection(
        z.object({
          title: z.string().optional().default(""),
          company: z.string(),
          summary: z.string().optional().default(""),
          currentlyWorking: z.boolean(),
        }),
        dateRangeSchema
      )
    )
    .optional()
    .default([]),
  skillSet: z.string().optional().default(""),
  resume: z
    .instanceof(File)
    .optional()
    .refine(
      (file) => !file || file.size <= 10 * 1024 * 1024,
      "Resume file must be smaller than 10MB"
    )
    .refine(
      (file) =>
        !file ||
        [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "application/octet-stream",
        ].includes(file.type),
      "Resume must be a PDF or Word document"
    ),
  state: z.string().optional().default(""),
  video: z
    .instanceof(File)
    .optional()
    .refine(
      (file) => !file || file.size <= 90 * 1024 * 1024,
      "Video file must be smaller than 90MB"
    )
    .refine(
      (file) =>
        !file ||
        [
          "video/mp4",
          "video/webm",
          "video/ogg",
          "video/x-msvideo",
          "video/quicktime",
        ].includes(file.type),
      "Video must be in MP4, WebM, OGG, AVI, or MOV format"
    ),
});

// Schema for after the user clicks the verification link
export const verificationSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters long"),
  confirmPassword: z
    .string()
    .min(8, "Password must be at least 8 characters long"),
  token: z.string().min(1, "Token is required"),
  uid: z.string().min(1, "User ID is required"),
});
