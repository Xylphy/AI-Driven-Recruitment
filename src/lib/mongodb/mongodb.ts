import { MongoClient, ServerApiVersion } from "mongodb";

const mongoDb_client = new MongoClient(
  process.env.MONGODB_URI ||
    (() => {
      throw new Error("MONGODB_URI is not defined");
    })(),
  {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  },
);

export default mongoDb_client;
