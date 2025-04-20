import { string, z } from "zod";

export const userSupabaseSchema = z.object({
  firstname: z.string().min(1, "First name is required"),
  lastname: z.string().min(1, "Last name is required"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  prefix: z.string().min(1, "Prefix is required"),
  firebase_uid: string().optional(),
});
