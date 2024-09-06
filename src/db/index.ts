import { drizzle } from "drizzle-orm/d1";
import type { Context } from "hono";
import * as schema from "./schema";

export function createDatabase(c: Context) {
  return drizzle(c.env.DB, { schema });
}

export default async function databaseProvider(
  c: Context,
  next: () => Promise<void>
) {
  if (!c.get("db")) {
    c.set("db", createDatabase(c));
  }
  await next();
}
