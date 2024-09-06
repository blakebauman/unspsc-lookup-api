import { Hono } from "hono";
import { z } from "zod";
import { unspscCodes } from "../db/schema";
import { D1Database } from "@cloudflare/workers-types";
import db from "../db";

export const searchRoutes = new Hono();

/**
 * Database provider middleware
 */
searchRoutes.use(async (c, next) => db(c, next));

const codeValidation = z
  .string()
  .regex(/^\d{2,8}$/, "Code must be between 2 and 8 digits");

// Search by code number
searchRoutes.get("/number/:code", async (c) => {
  const params = z.object({ code: codeValidation }).safeParse(ctx.req.param());

  if (!params.success) {
    return c.json({ error: params.error.message }, 400);
  }

  const { code } = z
    .object({ code: z.string().min(2).max(8) })
    .parse(c.req.param());

  const result = await c.var.db
    .select()
    .from(unspscCodes)
    .where((tbl) =>
      tbl.segment
        .like(`${code}%`)
        .or(tbl.family.like(`${code}%`))
        .or(tbl.class.like(`${code}%`))
        .or(tbl.commodity.like(`${code}%`))
    )
    .limit(20);

  if (result.length === 0) {
    return c.json({ message: "No results found" }, 404);
  }

  return c.json(result);
});

// Search by code name
searchRoutes.get("/name/:name", async (ctx) => {
  const { name } = z.object({ name: z.string().min(1) }).parse(ctx.req.param());

  const db = drizzle(ctx.env.DB as D1Database);

  const result = await db
    .select()
    .from(unspscCodes)
    .where((tbl) =>
      tbl.segment_name
        .like(`%${name}%`)
        .or(tbl.family_name.like(`%${name}%`))
        .or(tbl.class_name.like(`%${name}%`))
        .or(tbl.commodity_name.like(`%${name}%`))
    )
    .limit(20);

  if (result.length === 0) {
    return ctx.json({ message: "No results found" }, 404);
  }

  return ctx.json(result);
});

export default searchRoutes;
