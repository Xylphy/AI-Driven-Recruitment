"use server";

import store from "../store/store";
import { setSignupData } from "../store/registerReducer";
import { signupWithFirebase } from "./firebase/action";

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // Authenticate with supabase here
}

export async function signup(formData: FormData) {
  // store.dispatch(
  //   setSignupData({
  //     prefix: formData.get("prefix") as string,
  //     firstName: formData.get("firstName") as string,
  //     lastName: formData.get("lastName") as string,
  //     email: formData.get("email") as string,
  //     countryCode: formData.get("countryCode") as string,
  //     mobileNumber: formData.get("mobileNumber") as string,
  //     street: formData.get("street") as string,
  //     zip: formData.get("zip") as string,
  //     city: formData.get("city") as string,
  //     state_: formData.get("state") as string,
  //     country: formData.get("country") as string,
  //     jobTitle: formData.get("jobTitle") as string,
  //     skillSet: formData.get("skillSet") as string,
  //     success: false,
  //     error: null,
  //   })
  // );
  store.dispatch(
    setSignupData({
      prefix: "Mr." as string,
      firstName: "John" as string,
      lastName: "Doe" as string,
      countryCode: "+63" as string,
      mobileNumber: "1234567890" as string,
      street: "123 Main St" as string,
      zip: "12345" as string,
      city: "New York" as string,
      state_: "NY" as string,
      country: "USA" as string,
      jobTitle: "Software Engineer" as string,
      skillSet: "JavaScript, React" as string,
      success: false,
      error: null,
    })
  );
  signupWithFirebase("jameskennethacabal@gmail.com");
}
