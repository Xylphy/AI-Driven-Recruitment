import { sendSignInLinkToEmail } from "firebase/auth";
import { auth } from "./client";
import { RegisterState } from "@/types/types";
import { insertTokenData } from "../mongodb/action";
import admin from "./admin";
import mongoDb_client from "../mongodb/mongodb";

export async function sendEmailVerification(data: RegisterState) {
  await mongoDb_client.connect();
  const response = await insertTokenData(data);
  await mongoDb_client.close();

  if (response === null) {
    throw new Error("Failed to insert token data");
  }

  await sendSignInLinkToEmail(auth, data.email, {
    url: `${
      process.env.NODE_ENV === "development"
        ? "http://localhost:3000/"
        : process.env.NEXT_PUBLIC_SITE_URL
    }/verification/${response?.insertedId}`,
    handleCodeInApp: true,
  });
}

export async function isEmailRegistered(email: string): Promise<boolean> {
  try {
    return !!(await admin.getUserByEmail(email));
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
