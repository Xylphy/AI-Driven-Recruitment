import { createTRPCRouter } from "@/lib/trpc/init";
import authRouter from "./auth";
import jobListingRouter from "./joblisting";
import userRouter from "./user";
import candidateRouter from "./candidate";
import adminRouter from "./admin";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  joblisting: jobListingRouter,
  user: userRouter,
  candidate: candidateRouter,
  admin: adminRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
