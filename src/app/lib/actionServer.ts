"use server";

import { sendEmailVerification } from "./firebase/action";

export async function signup(formData: FormData) {
  try {
    // sendEmailVerification({
    //   prefix: formData.get("prefix") as string,
    //   firstName: formData.get("firstName") as string,
    //   lastName: formData.get("lastName") as string,
    //   email: formData.get("email") as string,
    //   countryCode: formData.get("countryCode") as string,
    //   mobileNumber: formData.get("mobileNumber") as string,
    //   street: formData.get("street") as string,
    //   zip: formData.get("zip") as string,
    //   city: formData.get("city") as string,
    //   state_: formData.get("state") as string,
    //   country: formData.get("country") as string,
    //   jobTitle: formData.get("jobTitle") as string,
    //   skillSet: formData.get("skillSet") as string,
    // });

    return {
      success: true,
      message: "Email sent successfully",
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to create account",
    };
  }
}
