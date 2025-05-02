"use server";

import { signupWithFirebase } from "./firebase/action";

export async function signup(formData: FormData) {
  console.log("File data", formData.get("resume"));

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
