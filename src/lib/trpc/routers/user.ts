import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getTokenData } from "@/lib/mongodb/action";
import mongoDb_client from "@/lib/mongodb/mongodb";
import { createTRPCRouter, rateLimitedProcedure } from "../init";

const userRouter = createTRPCRouter({
  fetchEmail: rateLimitedProcedure
    .input(z.object({ uid: z.string() }))
    .query(async ({ input }) => {
      await mongoDb_client.connect();

      const tokenData = await getTokenData(input.uid);
      if (!tokenData) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid token",
        });
      }

      await mongoDb_client.close();

      return { email: tokenData.email };
    }),
});

export default userRouter;
