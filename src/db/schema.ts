import { integer, text, sqliteTable, index } from "drizzle-orm/sqlite-core";

// Define the UNSPSC table schema
export const unspscCodes = sqliteTable(
  "unspsc_codes",
  {
    id: integer("id").primaryKey(),
    segment: text("segment").notNull(),
    segment_name: text("segment_name").notNull(),
    family: text("family").notNull(),
    family_name: text("family_name").notNull(),
    class: text("class").notNull(),
    class_name: text("class_name").notNull(),
    commodity: text("commodity").notNull(),
    commodity_name: text("commodity_name").notNull(),
  },
  (unspscCodes) => ({
    segmentIndex: index("segment_index").on(unspscCodes.segment),
    familyIndex: index("family_index").on(unspscCodes.family),
    classIndex: index("class_index").on(unspscCodes.class),
    commodityIndex: index("commodity_index").on(unspscCodes.commodity),
  })
);
