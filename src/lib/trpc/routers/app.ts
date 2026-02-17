import { createTRPCRouter } from "@/lib/trpc/init";
import {
  adminRouter,
  authRouter,
  candidateRouter,
  chatbotRouter,
  hrOfficer,
  jobListingRouter,
  staffRouter,
} from ".";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  joblisting: jobListingRouter,
  candidate: candidateRouter,
  admin: adminRouter,
  hrOfficer: hrOfficer,
  staff: staffRouter,
  chatbot: chatbotRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
