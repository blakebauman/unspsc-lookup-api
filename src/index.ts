import { Hono } from "hono";
import { searchRoutes } from "./routes/search";
import { filterRoutes } from "./routes/filter";
import { autocompleteRoutes } from "./routes/autocomplete";

import { cacheMiddleware } from "./middlewares/cache";
import { errorHandler } from "./middlewares/error";

import type { Environment } from "../env";
import db from "./db";

/**
 * Main Hono application
 */
const app = new Hono<Environment>();

/**
 * Cache middleware
 */
app.use("*", cacheMiddleware);

/**
 * Error handler middleware
 */
app.use("*", errorHandler);

/**
 * Database provider middleware
 */
app.use(async (c, next) => await db(c, next));

/**
 * Search API routes
 */
app.route("/api/search", searchRoutes);

/**
 * Autocomplete API routes
 */
app.route("/api/autocomplete", autocompleteRoutes);

/**
 * Filter API routes
 */
app.route("/api/filter", filterRoutes);

export default app;
