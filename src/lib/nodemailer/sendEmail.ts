import nodemailer from "nodemailer";

export async function sendEmail(
  applicationId: string,
  firstName: string,
  email: string,
) {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: email,
      subject: `New application received for ${firstName}`,
      text: `Hello ${firstName},
							Your application has been received. Your Application ID is: ${applicationId}
							Please keep this ID safe — you will need it to track your application status. You can track your application at:
							${process.env.NODE_ENV === "production" ? process.env.NEXT_PUBLIC_SITE_URL : "http://localhost:3000"}/track

							How to track:
							1. Go to the tracking page above.
							2. Enter your Application ID: ${applicationId}

							Best regards,
							Alliance Software Inc.`,
    });
    return { success: true };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
