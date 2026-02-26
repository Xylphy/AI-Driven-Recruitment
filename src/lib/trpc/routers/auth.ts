import { TRPCError } from "@trpc/server";
import { getEmailByUid, updateUserPassword } from "@/lib/firebase/action";
import { updatePasswordSchema } from "@/lib/schemas/user";
import { find } from "@/lib/supabase/action";
import { createClientServer } from "@/lib/supabase/supabase";
import { authorizedProcedure, createTRPCRouter } from "@/lib/trpc/init";
import type { Staff } from "@/types/schema";

const authRouter = createTRPCRouter({
  decodeJWT: authorizedProcedure.query(({ ctx }) => {
    // biome-ignore lint/style/noNonNullAssertion: JWT existence is guaranteed by authorizedProcedure
    return { user: ctx.userJWT! };
  }),
  updatePassword: authorizedProcedure
    .input(updatePasswordSchema)
    .mutation(async ({ input, ctx }) => {
      const supabase = await createClientServer(1, true);

      const { data: staff, error: staffError } = await find<Staff>(
        supabase,
        "staff",
        // biome-ignore lint/style/noNonNullAssertion: We check for ctx.userJWT existence in authorizedProcedure, so this is safe
        [{ column: "id", value: ctx.userJWT!.id }],
      ).single();

      if (staffError || !staff) {
        console.error("Error fetching staff for password update:", staffError);
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Staff member not found",
        });
      }

      const userEmail = await getEmailByUid(staff?.firebase_uid || "");
      try {
        await updateUserPassword(
          userEmail,
          input.currentPassword,
          input.newPassword,
        );

        return { success: true, message: "Password updated successfully" };
      } catch (error) {
        console.error("Password update failed:", error);
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            error instanceof Error
              ? error.message
              : "Failed to update password",
        });
      }
    }),
});

export default authRouter;
