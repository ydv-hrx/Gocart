import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { deleteCouponOnExpiry, syncUserCreation, syncUserDeletion, syncUserUpdation } from "@/inngest/functions";

// Force Node.js runtime (not Edge)
export const runtime = "nodejs";

// Create an API that serves zero functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    syncUserCreation,
    syncUserUpdation,
    syncUserDeletion,
    deleteCouponOnExpiry
  ],
});