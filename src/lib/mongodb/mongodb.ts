import { MongoClient, ServerApiVersion } from "mongodb";

function getMongoUri() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not defined");
  return uri;
}

const mongoOptions = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  connectTimeoutMS: 10000,
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 30000,
} as const;

declare global {
  var __mongoClient: MongoClient | undefined;
  var __mongoClientPromise: Promise<MongoClient> | undefined;
}

function createClient() {
  return new MongoClient(getMongoUri(), mongoOptions);
}

export function getMongoClient(): Promise<MongoClient> {
  if (!globalThis.__mongoClient) {
    globalThis.__mongoClient = createClient();
  }

  if (!globalThis.__mongoClientPromise) {
    globalThis.__mongoClientPromise = globalThis.__mongoClient
      .connect()
      .then(() => globalThis.__mongoClient as MongoClient)
      .catch((error) => {
        console.error("MongoDB connect failed:", error);
        globalThis.__mongoClientPromise = undefined;
        globalThis.__mongoClient = undefined;
        throw error;
      });
  }

  return globalThis.__mongoClientPromise;
}

export async function getMongoDb(dbName = "ai-driven-recruitment") {
  const client = await getMongoClient();
  return client.db(dbName);
}
