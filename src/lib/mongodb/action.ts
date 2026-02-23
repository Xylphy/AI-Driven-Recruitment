import type { RegisterState } from "@/types/types";
import { getMongoDb } from "./mongodb";

export async function insertTokenData(data: RegisterState) {
  return (await getMongoDb("ai-driven-recruitment"))
    .collection("verification_tokens")
    .insertOne({
      ...data,
      createdAt: new Date(),
    });
}

export async function findOne(db: string, collection: string, query: object) {
  return await getMongoDb(db).then((db) =>
    db.collection(collection).findOne(query),
  );
}

export function deleteDocument(db: string, collection: string, query: object) {
  return {
    many: async () => {
      return await getMongoDb(db).then((db) =>
        db.collection(collection).deleteMany(query),
      );
    },
    single: async () => {
      return await getMongoDb(db).then((db) =>
        db.collection(collection).deleteOne(query),
      );
    },
  };
}
