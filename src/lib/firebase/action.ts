import { auth } from "./admin";

export async function createUserWithEmailAndPassword(
  email: string,
  password: string,
) {
  try {
    const userRecord = await auth.createUser({
      email: email,
      password: password,
    });
    console.log("Successfully created new user:", userRecord.uid);
    return userRecord;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
}

/**
 * Verify user's current password before allowing password update
 * @param email - User's email
 * @param currentPassword - User's current password
 * @returns Promise with user ID token if credentials are valid
 */
async function verifyCurrentPassword(
  email: string,
  currentPassword: string,
): Promise<{ idToken: string; localId: string }> {
  const apiKey = process.env.FIREBASE_API_KEY;

  if (!apiKey) {
    throw new Error("FIREBASE_API_KEY is not configured");
  }

  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password: currentPassword,
        returnSecureToken: true,
      }),
    },
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Invalid current password");
  }

  const data = await response.json();
  return {
    idToken: data.idToken,
    localId: data.localId,
  };
}

/**
 * Update user's password after verifying current password
 * @param email - User's email
 * @param currentPassword - User's current password
 * @param newPassword - User's new password
 */
export async function updateUserPassword(
  email: string,
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  // First verify the current password
  const { localId } = await verifyCurrentPassword(email, currentPassword);

  // If verification succeeds, update the password using Admin SDK
  await auth.updateUser(localId, {
    password: newPassword,
  });
}

export async function getEmailByUid(uid: string): Promise<string> {
  try {
    const userRecord = await auth.getUser(uid);
    return userRecord.email || "";
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
}
