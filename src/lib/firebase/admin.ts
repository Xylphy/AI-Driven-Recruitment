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

function getAdminApp() {
  if (admin.apps.length) return admin.app();

  const config = firebaseConfigSchema.parse({
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  });

  return admin.initializeApp({
    credential: admin.credential.cert(config),
  });
}

export const getAuth = () => getAdminApp().auth();
export const getDb = () => getAdminApp().firestore();
export default admin;
