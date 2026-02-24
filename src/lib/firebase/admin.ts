import admin from "firebase-admin";
import { z } from "zod";

const firebaseConfigSchema = z.object({
  projectId: z.string().min(1, "FIREBASE_PROJECT_ID is required"),
  privateKey: z
    .string()
    .min(1, "FIREBASE_PRIVATE_KEY is required")
    .transform((key) => key.replace(/\\n/g, "\n")),
  clientEmail: z.string().min(1, "FIREBASE_CLIENT_EMAIL is required"),
});

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(
      firebaseConfigSchema.parse({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      }),
    ),
  });
}

export const auth = admin.auth();
export const db = admin.firestore();
export default admin;
