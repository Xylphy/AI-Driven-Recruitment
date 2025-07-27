"use server";

import { isEmailRegistered, sendEmailVerification } from "./firebase/action";
import { uploadFile } from "./cloudinary/cloudinary";
import { verifyCsrfToken } from "./csrf";
import { isValidFile } from "./library";

export async function signup(formData: FormData) {
  const csrfToken = formData.get("csrfToken");

  if (!csrfToken || !verifyCsrfToken(csrfToken as string)) {
    return {
      success: false,
      message: "Invalid request, please try again.",
    };
  }

  if (await isEmailRegistered(formData.get("email") as string)) {
    return {
      success: false,
      message: "Email is already registered. Please use a different email.",
    };
  }

  try {
    const file = formData.get("resume") as File;
    let resume_id = undefined;

    if (file) {
      if (!isValidFile(file)) {
        return {
          success: false,
          message: "Not a valid file type or size exceeds the limit of 10MB.",
        };
      }

      resume_id = await uploadFile(file, "resumes");
    }

    await sendEmailVerification({
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
      educationalDetails: JSON.parse(
        formData.get("educationalDetails") as string
      ),
      socialLinks: JSON.parse(formData.get("socialLinks") as string),
      publicId: resume_id,
      jobExperiences: JSON.parse(formData.get("jobExperiences") as string),
    });

    return {
      success: true,
      message: "Email sent successfully",
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : `Failed to create account`,
    };
  }
}
