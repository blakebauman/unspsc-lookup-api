import { Hono } from "hono";
import { z } from "zod";
import { unspscCodes } from "../db/schema";
import db from "../db";

export const autocompleteRoutes = new Hono();

/**
 * Database provider middleware
 */
autocompleteRoutes.use(async (c, next) => db(c, next));

// Autocomplete
autocompleteRoutes.get("/:query", async (c) => {
  const { query } = z.object({ query: z.string().min(1) }).parse(c.req.param());

  const result = await db
    .select()
    .from(unspscCodes)
    .where((tbl) =>
      tbl.segment_name
        .like(`%${query}%`)
        .or(tbl.family_name.like(`%${query}%`))
        .or(tbl.class_name.like(`%${query}%`))
        .or(tbl.commodity_name.like(`%${query}%`))
    )
    .limit(5);

  return c.json(result);
});

export default autocompleteRoutes;
