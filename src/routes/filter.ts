import { Hono } from "hono";
import { z } from "zod";
import { Context } from "hono";
import { eq } from "drizzle-orm";

import type { Environment } from "../../env";
import { unspscCodes } from "../db/schema";
import db from "../db";

// Filter routes
export const filterRoutes = new Hono<Environment>();

// Database provider middleware
filterRoutes.use(async (c, next) => db(c, next));

// Filter schema
const filterSchema = z.object({
  segment: z.string().optional(),
  family: z.string().optional(),
  class: z.string().optional(),
  commodity: z.string().optional(),
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(100).default(20),
});

// Filter by segment/family/class/commodity
filterRoutes.post("/", async (c: Context) => {
  const filter = filterSchema.parse(await c.req.json());
  const offset = (filter.page - 1) * filter.pageSize;

  let query = c.var.db
    .select()
    .from(unspscCodes)
    .limit(filter.pageSize)
    .offset(offset);

  if (filter.segment) {
    query = query.where(eq(unspscCodes.segment, filter.segment));
  }
  if (filter.family) {
    query = query.where(eq(unspscCodes.family, filter.family));
  }
  if (filter.class) {
    query = query.where(eq(unspscCodes.class, filter.class));
  }
  if (filter.commodity) {
    query = query.where(eq(unspscCodes.commodity, filter.commodity));
  }

  const result = await query;

  return c.json({
    data: result,
    page: filter.page,
    pageSize: filter.pageSize,
    total: result.length,
  });
});

export default filterRoutes;
