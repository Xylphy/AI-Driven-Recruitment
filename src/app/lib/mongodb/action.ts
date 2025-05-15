import { ObjectId } from "mongodb";
import mongoDb_client from "./mongodb";
import { RegisterState } from "@/app/types/types";

export async function insertTokenData(data: RegisterState) {
  try {
    await mongoDb_client.connect();

    return await mongoDb_client
      .db("ai-driven-recruitment")
      .collection("verification_tokens")
      .insertOne({
        ...data,
        createdAt: new Date(),
      });
  } catch (error) {
    console.error("Error inserting user data:", error);
  } finally {
    await mongoDb_client.close();
  }
}

export async function getTokenData(id: string) {
  try {
    await mongoDb_client.connect();

    return await mongoDb_client
      .db("ai-driven-recruitment")
      .collection("verification_tokens")
      .findOne({ _id: new ObjectId(id) }, { projection: { _id: 0 } });
  } catch (error) {
    console.error("Error retrieving token data:", error);
  } finally {
    await mongoDb_client.close();
  }
}

export async function findOne(db: string, collection: string, query: object) {
  try {
    await mongoDb_client.connect();
    return await mongoDb_client.db(db).collection(collection).findOne(query);
  } catch (error) {
    console.error("Error retrieving data:", error);
  } finally {
    await mongoDb_client.close();
  }
}

export async function deleteOne(db: string, collection: string, query: object) {
  try {
    await mongoDb_client.connect();
    return await mongoDb_client.db(db).collection(collection).deleteOne(query);
  } catch (error) {
    console.error("Error deleting data:", error);
  } finally {
    await mongoDb_client.close();
  }
}
