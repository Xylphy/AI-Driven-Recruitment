"use client";

import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import store from "../store/store";
import { setEmailData } from "../store/registerReducer";
import { signInWithEmailLink } from "firebase/auth";
import { auth } from "./firebase/firebase";

export async function completeSignup() {
  const email = useSelector((state: RootState) => state.registerData.email);
  if (email) {
    await signInWithEmailLink(auth, email, window.location.href);
    console.log("Email verified successfully");
  }
}

export function storeEmail(email: string) {
  store.dispatch(setEmailData(email));
}
