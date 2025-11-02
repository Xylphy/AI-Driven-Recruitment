import { createTRPCRouter } from "@/lib/trpc/init";
import { authRouter } from "./auth";
import { jobListingRouter } from "./joblisting";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  joblisting: jobListingRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
