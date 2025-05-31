import { z } from "zod";
import { dateRangeSchema } from "./common";

const educationalDetailSchema = z
  .object({
    degree: z.string().optional(),
    institute: z.string().optional(),
    currentlyPursuing: z.boolean(),
    major: z.string().optional(),
  })
  .merge(dateRangeSchema);

const socialLinkSchema = z.object({
  link: z.string().url("Invalid URL"),
});

const jobExperiences = z.object({
  title: z.string().optional(),
  company: z.string().optional(),
  summary: z.string().optional(),
  currentlyWorking: z.boolean(),
});

export const userSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  prefix: z.string().min(1, "Prefix is required"),
  phoneNumber: z.string().optional(),
  countryCode: z.enum(["+63", "+1", "+44", "+91"]).optional(),
  street: z.string().optional(),
  zip: z.string().optional(),
  country: z.enum(["PH", "US", "CA", "GB", "AU", "IN"]).optional(),
  city: z.string().optional(),
  jobTitle: z.string().optional(),
  educationalDetails: z.array(educationalDetailSchema).optional(),
  socialLinks: z.array(socialLinkSchema).optional(),
  jobExperiences: z.array(jobExperiences).optional(),
});
