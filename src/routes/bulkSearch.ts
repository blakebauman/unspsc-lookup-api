import { Context, Hono } from "hono";
import { inArray, or } from "drizzle-orm";
import { D1Database } from "@cloudflare/workers-types";
import { z } from "zod";

import type { Environment } from "../../env";
import { unspscCodes } from "../db/schema";
import db from "../db";

// Autocomplete routes
const bulkSearchRoutes = new Hono<Environment>();

// Database provider middleware
bulkSearchRoutes.use(async (c, next) => db(c, next));

const bulkSearchSchema = z.object({
  codes: z.array(z.string().min(2).max(8)), // Array of UNSPSC codes (2-8 digits)
});

// Bulk search API
bulkSearchRoutes.post("/bulk-search", async (c: Context) => {
  const body = await c.req.json();
  const validation = bulkSearchSchema.safeParse(body);

  if (!validation.success) {
    return c.json({ error: validation.error.errors }, 400);
  }

  const { codes } = validation.data;

  // Query the database for all the provided codes
  const results = await c.var.db
    .select()
    .from(unspscCodes)
    .where((tbl) => tbl.code.in(codes));

  c.var.db
    .select()
    .from(unspscCodes)
    //   .where(inArray(unspscCodes.code, [codes]));
    .where(or(inArray(unspscCodes.segmentName, [codes])));

  // If no results found, return a not found message
  if (!results.length) {
    return c.json({ message: "No results found for the provided codes" }, 404);
  }

  // Return the search results
  return c.json(results, 200);
});

export default bulkSearchRoutes;
