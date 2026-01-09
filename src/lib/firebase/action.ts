import { sendSignInLinkToEmail } from "firebase/auth";
import type { RegisterState } from "@/types/types";
import { insertTokenData } from "../mongodb/action";
import mongoDb_client from "../mongodb/mongodb";
import { auth as adminAuth } from "./admin";
import { auth } from "./client";

export async function sendEmailVerification(data: RegisterState) {
	await mongoDb_client.connect();
	const response = await insertTokenData(data);
	await mongoDb_client.close();

	if (response === null) {
		throw new Error("Failed to insert token data");
	}

	try {
		const verificationUrl = `${
			process.env.NODE_ENV === "development"
				? "http://localhost:3000/"
				: process.env.NEXT_PUBLIC_SITE_URL
		}/verification/${response.insertedId}`;
		console.log("Verification URL:", verificationUrl);

		await sendSignInLinkToEmail(auth, data.email, {
			url: verificationUrl,
			handleCodeInApp: true,
		});
		console.log("Sent verification email to", data.email);
	} catch (err) {
		console.log(String(err));
	}
}

export async function isEmailRegistered(email: string): Promise<boolean> {
	try {
		return !!(await adminAuth.getUserByEmail(email));
	} catch (error) {
		if (
			error &&
			typeof error === "object" &&
			"code" in error &&
			error.code === "auth/user-not-found"
		) {
			return false;
		}
		throw error;
	}
}
