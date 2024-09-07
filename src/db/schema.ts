import { sql } from "drizzle-orm";
import {
  integer,
  text,
  sqliteTable,
  index,
  unique,
} from "drizzle-orm/sqlite-core";

// Define the UNSPSC table schema
export const unspscCodes = sqliteTable(
  "unspsc_codes",
  {
    id: integer("id").primaryKey(),
    segment: text("segment").notNull(),
    segmentName: text("segment_name").notNull(),
    family: text("family").notNull(),
    familyName: text("family_name").notNull(),
    class: text("class").notNull(),
    className: text("class_name").notNull(),
    commodity: text("commodity").notNull(),
    commodityName: text("commodity_name").notNull(),
    version: text("version").references(() => unspscVersions.id, {
      onDelete: "cascade",
    }),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).default(
      sql`(CURRENT_TIMESTAMP)`
    ),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).default(
      sql`(CURRENT_TIMESTAMP)`
    ),
  },
  (unspscCodes) => ({
    segmentIndex: index("segment_index").on(unspscCodes.segment),
    familyIndex: index("family_index").on(unspscCodes.family),
    classIndex: index("class_index").on(unspscCodes.class),
    commodityIndex: index("commodity_index").on(unspscCodes.commodity),
    segmentFamilyIndex: index("segment_family_index").on(
      unspscCodes.segment,
      unspscCodes.family
    ),
  })
);

// UNSPSC Versions Table
export const unspscVersions = sqliteTable(
  "unspsc_versions",
  {
    id: integer("id").primaryKey(),
    version: text("version").notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).default(
      sql`(CURRENT_TIMESTAMP)`
    ),
  },
  (unspscVersions) => ({
    uniqueVersion: unique("version_unique").on(unspscVersions.version),
  })
);

export const searchAnalytics = sqliteTable("search_analytics", {
  id: integer("id").primaryKey(),
  code: text("code").notNull(),
  searchCount: integer("search_count").notNull(),
  lastSearched: integer("last_searched", { mode: "timestamp_ms" }).default(
    sql`(CURRENT_TIMESTAMP)`
  ),
});

export const errorAnalytics = sqliteTable("error_analytics", {
  id: integer("id").primaryKey(),
  errorMessage: text("error_message").notNull(),
  errorCount: integer("error_count").notNull(),
  timestamp: integer("timestamp", { mode: "timestamp_ms" }).default(
    sql`(CURRENT_TIMESTAMP)`
  ),
});

// Table for API usage analytics
export const usageAnalytics = sqliteTable("usage_analytics", {
  id: integer("id").primaryKey(),
  endpoint: text("endpoint").notNull(),
  requestCount: integer("request_count").notNull(),
  timestamp: integer("timestamp", { mode: "timestamp_ms" }).default(
    sql`(CURRENT_TIMESTAMP)`
  ),
});
