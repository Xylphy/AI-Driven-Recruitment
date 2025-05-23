import { sendSignInLinkToEmail } from "firebase/auth";
import { db, auth } from "./firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { RegisterState } from "@/types/types";
import { insertTokenData } from "../mongodb/action";

export async function sendEmailVerification(data: RegisterState) {
  const querySnapshot = await getDocs(
    query(collection(db, "users"), where("email", "==", data.email))
  );

  if (!querySnapshot.empty) {
    throw new Error("Email already exists");
  }

  const response = await insertTokenData(data);

  await sendSignInLinkToEmail(auth, data.email, {
    url: `${
      process.env.NODE_ENV === "development"
        ? "http://localhost:3000/"
        : process.env.NEXT_PUBLIC_SITE_URL
    }/verification/${response?.insertedId}`,
    handleCodeInApp: true,
  });
}
