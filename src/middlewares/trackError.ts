import { HonoContext } from "hono";
import { drizzle } from "drizzle-orm";
import { errorAnalytics } from "../db/schema";
import { D1Database } from "@cloudflare/workers-types";

export const trackError = async (
  ctx: HonoContext,
  next: () => Promise<void>
) => {
  try {
    await next();
  } catch (err) {
    console.error("Error occurred:", err);

    const db = drizzle(ctx.env.DB as D1Database);
    const errorMessage = err.message || "Unknown error";
    const timestamp = new Date().toISOString();

    // Check if the error already exists
    const [existingError] = await db
      .select()
      .from(errorAnalytics)
      .where((tbl) => tbl.error_message.eq(errorMessage));

    if (existingError) {
      // Increment error count
      await db
        .update(errorAnalytics)
        .set({ error_count: existingError.error_count + 1 })
        .where((tbl) => tbl.error_message.eq(errorMessage));
    } else {
      // Insert new error entry
      await db
        .insert(errorAnalytics)
        .values({ error_message: errorMessage, error_count: 1, timestamp });
    }
  }
};
