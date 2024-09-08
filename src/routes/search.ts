import { Context, Hono } from "hono";
import { number, z } from "zod";
import { like, or, eq, and } from "drizzle-orm";

import type { Bindings, Variables } from "../../env";
import { unspscVersions } from "../db/schema";
import db from "../db";
import SearchService from "../services/searchService";
import { HTTPException } from "hono/http-exception";

const LATEST_UNSPSC_VERSION = "17.1001";

// List of supported versions (could also be fetched dynamically from the database)
const SUPPORTED_VERSIONS = [
  "17.1001",
  // "18.0801",
  // "19.0501",
  // "20.0601",
  // "21.0901",
  // "22.0601",
  // "23.0701",
  // "24.0301",
  // "25.0901",
  // "26.0801",
];

// Middleware to validate UNSPSC version
const validateVersion = (version: string) => {
  if (!SUPPORTED_VERSIONS.includes(version)) {
    return false;
  }
  return true;
};

// Code validation
const codeValidation = z
  .string()
  .regex(/^\d{2,8}$/, "Code must be between 2 and 8 digits");

// Search schema
const searchCodeSchema = z.object({
  query: codeValidation, // Code must be between 2 and 8 digits
  version: z.string().optional(),
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(100).default(20),
});

// Search schema
const searchSchema = z.object({
  query: z.string().min(1),
  version: z.string().optional(),
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(100).default(40),
});

// Search routes
export const searchRoutes = new Hono<{
  Bindings: Bindings;
  Variables: Variables & { searchService: SearchService };
}>();

// Database provider middleware
searchRoutes.use(async (c, next) => await db(c, next));

// Middleware to validate UNSPSC version
searchRoutes.use(async (c, next) => {
  const { version } = c.req.query();
  if (version && !validateVersion(version)) {
    return c.json(
      {
        message: `Unsupported UNSPSC Codeset version: ${version}.`,
      },
      404
    );
  }

  await next();
});

// Middleware to instantiate the search service
searchRoutes.use(async (c, next) => {
  const searchService = new SearchService();
  if (!c.get("searchService")) {
    c.set("searchService", searchService);
  }
  await next();
});

// Search by code unspsc
searchRoutes.get("/", async (c: Context) => {
  const { query, version, page, pageSize } = searchSchema.parse(c.req.query());
  console.log(`Received request to search for unspsc: ${query}`);
  const offset = (Number(page) - 1) * Number(pageSize);
  const selectedVersion = version ?? LATEST_UNSPSC_VERSION;

  const result = await c.var.searchService.getUnspscCodesByQuery(
    c,
    query,
    selectedVersion,
    Number(pageSize),
    Number(offset)
  );

  if (result.length === 0) {
    return c.json({ message: "No results found" }, 404);
  }

  return c.json({
    data: result,
    page: page,
    pageSize: pageSize,
    total: result.length,
  });
});

// Fetch UNSPSC codes in a hierarchical structure with pagination and filtering
searchRoutes.get("/hierarchy", async (c) => {
  try {
    const {
      version,
      segment,
      family,
      classCode,
      limit = 50,
      offset = 0,
    } = c.req.query();

    // if (!segment && !family && !classCode) {
    //   throw new Error(
    //     "At least one of segment, family, or classCode must be specified."
    //   );
    // }

    const selectedVersion = version ?? LATEST_UNSPSC_VERSION;

    const result = await c.var.searchService.getUnspscCodesHierarchy(
      c,
      selectedVersion,
      segment,
      family,
      classCode,
      limit,
      offset
    );

    console.log(result);

    if (!result.length) {
      return c.json(
        { message: "No UNSPSC codes found for the specified parameters" },
        404
      );
    }

    // Build hierarchical view
    const hierarchy: { [key: string]: any } = {};

    result.forEach(
      ({
        unspsc_codes: {
          segment,
          segmentName,
          family,
          familyName,
          class: classCode,
          className,
          commodity,
          commodityName,
        },
      }: {
        unspsc_codes: {
          segment: string;
          segmentName: string;
          family: string;
          familyName: string;
          class: string;
          className: string;
          commodity: string;
          commodityName: string;
        };
      }) => {
        // Segment level
        if (!hierarchy[segment]) {
          hierarchy[segment] = {
            segmentName,
            families: {},
          };
        }

        // Family level under Segment
        if (!hierarchy[segment].families[family]) {
          hierarchy[segment].families[family] = {
            familyName,
            classes: {},
          };
        }

        // Class level under Family
        if (!hierarchy[segment].families[family].classes[classCode]) {
          hierarchy[segment].families[family].classes[classCode] = {
            className,
            commodities: {},
          };
        }

        // Commodity level under Class
        if (
          !hierarchy[segment].families[family].classes[classCode].commodities[
            commodity
          ]
        ) {
          hierarchy[segment].families[family].classes[classCode].commodities[
            commodity
          ] = {
            commodityName,
          };
        }
      }
    );

    return c.json({ hierarchy, limit: limit, offset: offset }, 200);
  } catch (err) {
    return c.json({ error: (err as Error).message }, 400);
  }
});

// Fetch distinct versions from the unspsc_versions table
searchRoutes.get("/versions", async (c) => {
  const versions = await c.var.db
    .select({ version: unspscVersions.version })
    .from(unspscVersions);

  return c.json({ supported_versions: versions.map((v) => v.version) }, 200);
});

export default searchRoutes;
