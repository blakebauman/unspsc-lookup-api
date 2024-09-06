import { Context, Hono } from "hono";
import { z } from "zod";
import { like, or } from "drizzle-orm";

import type { Environment } from "../../env";
import { unspscCodes } from "../db/schema";
import db from "../db";

// Search routes
export const searchRoutes = new Hono<Environment>();

// Database provider middleware
searchRoutes.use(async (c, next) => await db(c, next));

// Code validation
const codeValidation = z
  .string()
  .regex(/^\d{2,8}$/, "Code must be between 2 and 8 digits");

// Search schema
const searchNumberSchema = z.object({
  code: codeValidation, // Code must be between 2 and 8 digits
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(100).default(20),
});

// Search schema
const searchNameSchema = z.object({
  name: z.string().min(1),
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(100).default(20),
});

// Search by code number
searchRoutes.get("/number/:code", async (c: Context) => {
  console.log(`Received request to search for code: ${c.req.param("code")}`);
  const validation = searchNumberSchema.safeParse(c.req.param());

  if (!validation.success) {
    return c.json({ error: validation.error.message }, 400);
  }

  const { code, page, pageSize } = searchNumberSchema.parse(c.req.param());
  const offset = (page - 1) * pageSize;

  const result = await c.var.db
    .select()
    .from(unspscCodes)
    .where(
      or(
        like(unspscCodes.segment, `${code}%`),
        like(unspscCodes.family, `${code}%`),
        like(unspscCodes.class, `${code}%`),
        like(unspscCodes.commodity, `${code}%`)
      )
    )
    .limit(pageSize)
    .offset(offset);

  if (result.length === 0) {
    return c.json({ message: "No results found" }, 404);
  }

  return c.json(result);
});

// Search by code name
searchRoutes.get("/name/:name", async (c: Context) => {
  const { name, page, pageSize } = searchNameSchema.parse(c.req.param());
  const offset = (page - 1) * pageSize;

  const result = await c.var.db
    .select()
    .from(unspscCodes)
    .where(
      or(
        like(unspscCodes.segment_name, `${name}%`),
        like(unspscCodes.family_name, `${name}%`),
        like(unspscCodes.class_name, `${name}%`),
        like(unspscCodes.commodity_name, `${name}%`)
      )
    )
    .limit(pageSize)
    .offset(offset);

  if (result.length === 0) {
    return c.json({ message: "No results found" }, 404);
  }

  return c.json(result);
});

export default searchRoutes;
