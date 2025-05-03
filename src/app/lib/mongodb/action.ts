import { ObjectId } from "mongodb";
import mongoDb_client from "./mongodb";
import { RegisterState } from "@/app/types/types";

export async function insertTokenData(data: RegisterState) {
  try {
    await mongoDb_client.connect();

    const user = {
      ...data,
      createdAt: new Date(),
    };

    return await mongoDb_client
      .db("ai-driven-recruitment")
      .collection("verification_tokens")
      .insertOne(user);
  } catch (error) {
    console.error("Error inserting user data:", error);
  } finally {
    await mongoDb_client.close();
  }
}

export async function getTokenData(id: string) {
  try {
    await mongoDb_client.connect();

    const query = { _id: new ObjectId(id) };
    const options = { projection: { _id: 0 } };

    const result = await mongoDb_client
      .db("ai-driven-recruitment")
      .collection("verification_tokens")
      .findOne(query, options);

    return result;
  } catch (error) {
    console.error("Error retrieving token data:", error);
  } finally {
    await mongoDb_client.close();
  }
}
