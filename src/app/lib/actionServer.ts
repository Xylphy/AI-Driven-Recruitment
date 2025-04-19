"use server";

import { isSignInWithEmailLink } from "firebase/auth";
import { signupWithFirebase } from "./firebase/action";
import { getTokenData } from "./mongodb/action";
import { auth } from "./firebase/firebase";

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // Authenticate with supabase here
}

export async function signup(formData: FormData) {
  signupWithFirebase({
    prefix: formData.get("prefix") as string,
    firstName: formData.get("firstName") as string,
    lastName: formData.get("lastName") as string,
    email: formData.get("email") as string,
    countryCode: formData.get("countryCode") as string,
    mobileNumber: formData.get("mobileNumber") as string,
    street: formData.get("street") as string,
    zip: formData.get("zip") as string,
    city: formData.get("city") as string,
    state_: formData.get("state") as string,
    country: formData.get("country") as string,
    jobTitle: formData.get("jobTitle") as string,
    skillSet: formData.get("skillSet") as string,
  });
}