import { z } from "zod";
import { REGULAR_STAFF_ROLES } from "../constants";

export const userSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.email("Invalid email address"),
  contactNumber: z.string(),
  street: z.string().optional().default(""),
  zip: z.string().optional().default(""),
  city: z.string().optional().default(""),
  socialLinks: z
    .array(
      z.object({
        value: z.url("Invalid URL"),
      }),
    )
    .optional()
    .default([]),
  state: z.string().optional().default(""),
  skills: z.array(
    z.object({
      id: z.number(),
      rating: z.number().min(0).max(5).default(0),
    }),
  ),
});

export const filesSchema = z.object({
  transcript: z
    .custom<File>((file) => file instanceof File, {
      message: "Invalid input",
    })
    .refine(
      (file) => file.size <= 90 * 1024 * 1024,
      "Transcript file must be smaller than 90MB",
    )
    .refine(
      (file) =>
        [
          "video/mp4",
          "video/webm",
          "video/ogg",
          "video/x-msvideo",
          "video/quicktime",
        ].includes(file.type),
      "Video must be in MP4, WebM, OGG, AVI, or MOV format",
    ),
  resume: z
    .custom<File>((file) => file instanceof File, {
      message: "Invalid input",
    })
    .refine(
      (file) => file.size <= 10 * 1024 * 1024,
      "Resume file must be smaller than 10MB",
    )
    .refine(
      (file) => ["application/pdf"].includes(file.type),
      "Resume must be a PDF or Word document",
    ),
});

export const addStaffSchema = z.object({
  email: z.email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: z.enum(REGULAR_STAFF_ROLES),
  password: z.string().min(8),
});

export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(8),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter"),
  confirmPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter"),
});
