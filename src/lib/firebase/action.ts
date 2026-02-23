import { auth as adminAuth } from "./admin";

export async function isEmailRegistered(email: string): Promise<boolean> {
  try {
    return !!(await adminAuth.getUserByEmail(email));
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "auth/user-not-found"
    ) {
      return false;
    }
    throw error;
  }
}
