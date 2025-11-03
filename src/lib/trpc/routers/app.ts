import { createTRPCRouter } from "@/lib/trpc/init";
import authRouter from "./auth";
import jobListingRouter from "./joblisting";
import userRouter from "./user";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  joblisting: jobListingRouter,
  user: userRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
