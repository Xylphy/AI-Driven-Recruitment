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
