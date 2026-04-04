import { type FirebaseApp, getApps, initializeApp } from "firebase/app";
import { getAuth as firebaseGetAuth } from "firebase/auth";
import { z } from "zod";

const firebaseConfigSchema = z.object({
  apiKey: z.string().min(1, "NEXT_PUBLIC_FIREBASE_API_KEY is required"),
  authDomain: z.string().min(1, "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN is required"),
  projectId: z.string().min(1, "NEXT_PUBLIC_FIREBASE_PROJECT_ID is required"),
  storageBucket: z
    .string()
    .min(1, "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET is required"),
  messagingSenderId: z
    .string()
    .min(1, "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID is required"),
  appId: z.string().min(1, "NEXT_PUBLIC_FIREBASE_APP_ID is required"),
});

let parsedConfig: z.infer<typeof firebaseConfigSchema> | null = null;
function getFirebaseConfig() {
  if (!parsedConfig) {
    parsedConfig = firebaseConfigSchema.parse({
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    });
  }
  return parsedConfig;
}

let app: FirebaseApp | undefined;
function initApp(): FirebaseApp {
  if (!app) {
    const apps = getApps();
    app = apps.length ? apps[0] : initializeApp(getFirebaseConfig());
  }
  // biome-ignore lint/style/noNonNullAssertion: app is guaranteed to be initialized at this point
  return app!;
}

/**
 * Lazy getters — initialize Firebase only when these are first called.
 */
export function getAuthInstance() {
  return firebaseGetAuth(initApp());
}
