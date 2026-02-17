import { authorizedProcedure, createTRPCRouter } from "@/lib/trpc/init";

const authRouter = createTRPCRouter({
  decodeJWT: authorizedProcedure.query(({ ctx }) => {
    // biome-ignore lint/style/noNonNullAssertion: JWT is guaranteed to be present here
    return { user: ctx.userJWT! };
  }),
});

export default authRouter;
