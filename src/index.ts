import { Hono } from "hono";
import { searchRoutes } from "./routes/search";
import { filterRoutes } from "./routes/filter";
import { autocompleteRoutes } from "./routes/autocomplete";
import { cacheMiddleware } from "./middlewares/cache";
import { errorHandler } from "./middlewares/error";

import db from "./db";

const app = new Hono();

// Apply Cache Middleware to all routes
app.use("*", cacheMiddleware);

// Apply Error middleware to all routes
app.use("*", errorHandler);

/**
 * Database provider middleware
 */
app.use(async (c, next) => db(c, next));

// Search API routes
app.route("/api/search", searchRoutes);

// Filter API routes
app.route("/api/filter", filterRoutes);

// Autocomplete API routes
app.route("/api/autocomplete", autocompleteRoutes);

export default app;
