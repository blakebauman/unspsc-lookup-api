import { Hono } from "hono";
import { z } from "zod";
import { unspscCodes } from "../db/schema";
import db from "../db";
import { D1Database } from "@cloudflare/workers-types";

export const filterRoutes = new Hono();

const filterSchema = z.object({
  segment: z.string().optional(),
  family: z.string().optional(),
  class: z.string().optional(),
  commodity: z.string().optional(),
});

/**
 * Database provider middleware
 */
filterRoutes.use(async (c, next) => db(c, next));

// Filter by segment/family/class/commodity
filterRoutes.post("/", async (ctx) => {
  const filter = filterSchema.parse(await ctx.req.json());

  const db = drizzle(ctx.env.DB as D1Database);

  let query = db.select().from(unspscCodes).limit(20);

  if (filter.segment) {
    query = query.where((tbl) => tbl.segment.eq(filter.segment));
  }
  if (filter.family) {
    query = query.where((tbl) => tbl.family.eq(filter.family));
  }
  if (filter.class) {
    query = query.where((tbl) => tbl.class.eq(filter.class));
  }
  if (filter.commodity) {
    query = query.where((tbl) => tbl.commodity.eq(filter.commodity));
  }

  const result = await query;

  return ctx.json(result);
});

export default filterRoutes;
