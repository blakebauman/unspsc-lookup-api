import { Hono } from "hono";
import { searchRoutes } from "./routes/search";
import { bulkSearchRoutes } from "./routes/bulkSearch";
import { filterRoutes } from "./routes/filter";
import { autocompleteRoutes } from "./routes/autocomplete";

import { apiKeyAuth } from "./middlewares/auth";
import { cacheMiddleware } from "./middlewares/cache";
import { errorHandler } from "./middlewares/error";
import { rateLimit } from "./middlewares/rateLimit";

import type { Environment } from "../env";
import db from "./db";

/**
 * Main Hono application
 */
const app = new Hono<Environment>();

/**
 * Rate limiting middleware
 */
app.use(rateLimit);

/**
 * Error handler middleware
 */
app.use(errorHandler);

/**
 * API key authentication middleware
 */
app.use(apiKeyAuth);

/**
 * Cache middleware
 */
app.use(cacheMiddleware);

/**
 * Database provider middleware
 */
app.use(async (c, next) => await db(c, next));

/**
 * Search API routes
 */
app.route("/api/search", searchRoutes);

/**
 * Bulk search API routes
 */
app.route("/api/bulk-search", bulkSearchRoutes);

/**
 * Autocomplete API routes
 */
app.route("/api/autocomplete", autocompleteRoutes);

/**
 * Filter API routes
 */
app.route("/api/filter", filterRoutes);

/**
 * 404 handler
 */
app.notFound(async (c) => c.text("You are lost!", 404));

export default app;
