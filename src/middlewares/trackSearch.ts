import { Context } from "hono";
import { eq } from "drizzle-orm";
import { searchAnalytics } from "../db/schema";

export const trackSearch = async (c: Context, next: () => Promise<void>) => {
  const code = c.req.param("code");

  if (code) {
    // Check if the code already exists in the analytics table
    const [existingEntry] = await c.var.db
      .select()
      .from(searchAnalytics)
      .where(eq(searchAnalytics.code, code));

    if (existingEntry) {
      // Increment the search count
      await c.var.db
        .update(searchAnalytics)
        .set({ search_count: existingEntry.search_count + 1 })
        .where(eq(searchAnalytics.code, code));
    } else {
      // Add new entry with search count 1
      await c.var.db.insert(searchAnalytics).values({ code, search_count: 1 });
    }
  }

  await next(); // Proceed with the request
};
