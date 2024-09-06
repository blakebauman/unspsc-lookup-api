import type { DrizzleD1Database } from "drizzle-orm/d1";
import type { Env } from "hono";

export type Bindings = {
  DB: D1Database;
};

export type Variables = {
  db: DrizzleD1Database<Record<string, never>>;
};

export type Environment = Env & {
  Bindings: Bindings;
  Variables: Variables;
};
