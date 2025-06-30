import { sendSignInLinkToEmail } from "firebase/auth";
import { auth } from "./client";
import { collection, query, where, getDocs } from "firebase/firestore";
import { RegisterState } from "@/types/types";
import { insertTokenData } from "../mongodb/action";
import admin from "./admin";

export async function sendEmailVerification(data: RegisterState) {
  const response = await insertTokenData(data);

  if (response === null) {
    throw new Error("Failed to insert token data");
  }

  // await sendSignInLinkToEmail(auth, data.email, {
  //   url: `${
  //     process.env.NODE_ENV === "development"
  //       ? "http://localhost:3000/"
  //       : process.env.NEXT_PUBLIC_SITE_URL
  //   }/verification/${response?.insertedId}`,
  //   handleCodeInApp: true,
  // });
  console.log(
    `Email verification link sent to ${data.email}. Verification ID: ${
      response?.insertedId || "N/A"
    }`
  );
}