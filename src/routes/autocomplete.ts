import { Context, Hono } from "hono";
import { z } from "zod";
import { or, like } from "drizzle-orm";

import type { Environment } from "../../env";
import { unspscCodes } from "../db/schema";
import db from "../db";

// Autocomplete routes
export const autocompleteRoutes = new Hono<Environment>();

// Database provider middleware
autocompleteRoutes.use(async (c, next) => db(c, next));

// Add pagination parameters in the autocomplete schema
const autocompleteSchema = z.object({
  query: z.string().min(1),
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(100).default(20),
});

// Keyword autocomplete API
autocompleteRoutes.get("/:query", async (c: Context) => {
  const autocomplete = autocompleteSchema.parse(c.req.param());
  const offset = (autocomplete.page - 1) * autocomplete.pageSize;

  const result = await c.var.db
    .select()
    .from(unspscCodes)
    .where(
      or(
        like(unspscCodes.segmentName, `${autocomplete.query}%`),
        like(unspscCodes.familyName, `${autocomplete.query}%`),
        like(unspscCodes.className, `${autocomplete.query}%`),
        like(unspscCodes.commodityName, `${autocomplete.query}%`)
      )
    )
    .limit(autocomplete.pageSize)
    .offset(offset);

  return c.json({
    data: result,
    page: autocomplete.page,
    pageSize: autocomplete.pageSize,
    total: result.length,
  });
});

export default autocompleteRoutes;
