import { authorizedProcedure, createTRPCRouter } from "@/lib/trpc/init";
import { TRPCError } from "@trpc/server";

const authRouter = createTRPCRouter({
  checkStatus: authorizedProcedure.query(({ ctx }) => {
    const decoded = ctx.userJWT!;

    if (decoded.exp && decoded.exp - Math.floor(Date.now() / 1000) < 15 * 60) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Token is about to expire",
      });
    }
    return { message: "Token is valid" };
  }),
  decodeJWT: authorizedProcedure.query(({ ctx }) => {
    return { user: ctx.userJWT! };
  }),
});

export default authRouter;
