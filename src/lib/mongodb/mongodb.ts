import { MongoClient, ServerApiVersion } from "mongodb";

const uri =
  process.env.MONGODB_URI ||
  (() => {
    throw new Error("MONGODB_URI is not defined");
  })();

const mongoOptions = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
} as const;

declare global {
  var __mongoClient: MongoClient | undefined;
  var __mongoClientPromise: Promise<MongoClient> | undefined;
}

function createClient() {
  return new MongoClient(uri, mongoOptions);
}

export function getMongoClient(): Promise<MongoClient> {
  if (!globalThis.__mongoClient) {
    globalThis.__mongoClient = createClient();
  }

  if (!globalThis.__mongoClientPromise) {
    globalThis.__mongoClientPromise = globalThis.__mongoClient
      .connect()
      .then(() => globalThis.__mongoClient as MongoClient);
  }

  return globalThis.__mongoClientPromise;
}

export async function getMongoDb(dbName = "ai-driven-recruitment") {
  const client = await getMongoClient();
  return client.db(dbName);
}
