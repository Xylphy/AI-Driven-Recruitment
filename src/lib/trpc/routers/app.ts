import { createTRPCRouter } from "@/lib/trpc/init";
import {
	adminRouter,
	authRouter,
	candidateRouter,
	hrOfficer,
	jobListingRouter,
	staffRouter,
	userRouter,
} from ".";

export const appRouter = createTRPCRouter({
	auth: authRouter,
	joblisting: jobListingRouter,
	user: userRouter,
	candidate: candidateRouter,
	admin: adminRouter,
	hrOfficer: hrOfficer,
	staff: staffRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
