import { TRPCError } from "@trpc/server";
import { authorizedProcedure, createTRPCRouter } from "@/lib/trpc/init";

const authRouter = createTRPCRouter({
  checkStatus: authorizedProcedure.query(({ ctx }) => {
    const decoded = ctx.userJWT ? ctx.userJWT : null;

    if (!decoded) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "No valid token found",
      });
    }

    if (decoded.exp && decoded.exp - Math.floor(Date.now() / 1000) < 15 * 60) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Token is about to expire",
      });
    }

    return { message: "Token is valid" };
  }),
  decodeJWT: authorizedProcedure.query(({ ctx }) => {
    // biome-ignore lint/style/noNonNullAssertion: JWT is guaranteed to be present here
    return { user: ctx.userJWT! };
  }),
});

export default authRouter;
