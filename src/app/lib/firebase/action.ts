import { sendSignInLinkToEmail } from "firebase/auth";
import { db, auth } from "./firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { redirect } from "next/navigation";
import { RegisterState } from "@/app/types/types";
import { insertTokenData } from "../mongodb/action";

export async function signupWithFirebase(data: RegisterState) {
  try {
    const querySnapshot = await getDocs(
      query(collection(db, "users"), where("email", "==", data.email))
    );

    if (!querySnapshot.empty) {
      redirect("/login");
    }

    const response = await insertTokenData(data);

    await sendSignInLinkToEmail(auth, data.email, {
      url: `http://localhost:3000/verification/${response?.insertedId}`,
      handleCodeInApp: true,
    });
  } catch (error) {
    console.error(error);
  }
}
