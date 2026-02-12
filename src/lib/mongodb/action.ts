import { ObjectId } from "mongodb";
import type { RegisterState } from "@/types/types";
import mongoDb_client from "./mongodb";

export async function insertTokenData(data: RegisterState) {
  return await mongoDb_client
    .db("ai-driven-recruitment")
    .collection("verification_tokens")
    .insertOne({
      ...data,
      createdAt: new Date(),
    });
}

export async function getTokenData(id: string) {
  return await mongoDb_client
    .db("ai-driven-recruitment")
    .collection("verification_tokens")
    .findOne({ _id: new ObjectId(id) }, { projection: { _id: 0 } });
}

export async function findOne(db: string, collection: string, query: object) {
  return await mongoDb_client.db(db).collection(collection).findOne(query);
}

export function deleteDocument(db: string, collection: string, query: object) {
  return {
    many: async () => {
      return await mongoDb_client
        .db(db)
        .collection(collection)
        .deleteMany(query);
    },
    single: async () => {
      return await mongoDb_client
        .db(db)
        .collection(collection)
        .deleteOne(query);
    },
  };
}
