import { ObjectId } from "mongodb";
import client from "./mongodb";

export async function insertTokenData(data: {
  prefix: string;
  firstName: string;
  lastName: string;
  email: string;
  countryCode: string;
  mobileNumber: string;
  street: string;
  zip: string;
  city: string;
  state_: string;
  country: string;
  jobTitle: string;
  skillSet: string;
}) {
  try {
    await client.connect();

    const user = {
      ...data,
      createdAt: new Date(),
    };

    return await client
      .db("ai-driven-recruitment")
      .collection("verification_tokens")
      .insertOne(user);
  } catch (error) {
    console.error("Error inserting user data:", error);
  } finally {
    await client.close();
  }
}

export async function getTokenData(id: string) {
  try {
    await client.connect();

    const query = { _id: new ObjectId(id) };
    const options = { projection: { _id: 0 } };

    const result = await client
      .db("ai-driven-recruitment")
      .collection("verification_tokens")
      .findOne(query, options);

    return result;
  } catch (error) {
    console.error("Error retrieving token data:", error);
  } finally {
    await client.close();
  }
}
