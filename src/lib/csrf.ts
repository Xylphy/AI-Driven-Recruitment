import { cookies } from "next/headers";

export async function generateCsrfToken(): Promise<string> {
	const buffer = new Uint8Array(32);
	crypto.getRandomValues(buffer);
	const csrfToken = Array.from(buffer)
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");

	(await cookies()).set("csrf_token", csrfToken, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "strict",
		maxAge: 60 * 60, // 1 hour
	});
	return csrfToken;
}

export async function verifyCsrfToken(token: string): Promise<boolean> {
	const csrfCookie = (await cookies()).get("csrf_token");
	if (!csrfCookie) {
		return false;
	}
	return token === csrfCookie.value;
}
