import { unspscCodes } from "./schema";
import { D1Database } from "@cloudflare/workers-types";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

// Sample UNSPSC data (replace with the actual JSON data for full seeding)
// const unspscData = [
//   {
//     segment: "10000000",
//     segment_name: "Live Plant and Animal Material and Accessories and Supplies",
//     family: "10100000",
//     family_name: "Live animals",
//     class: "10101500",
//     class_name: "Livestock",
//     commodity: "10101501",
//     commodity_name: "Cats",
//   },
//   {
//     segment: "10000000",
//     segment_name: "Live Plant and Animal Material and Accessories and Supplies",
//     family: "10100000",
//     family_name: "Live animals",
//     class: "10101500",
//     class_name: "Livestock",
//     commodity: "10101502",
//     commodity_name: "Dogs",
//   },
//   // Add more data here from the JSON file
// ];

interface UNSPSC {
  segment: string;
  segment_name: string;
  family: string;
  family_name: string;
  class: string;
  class_name: string;
  commodity: string;
  commodity_name: string;
}

const response = await fetch("../../data/unspsc.json");
const unspscData: Array<UNSPSC> = (await response.json()) as Array<UNSPSC>;

export const seedDatabase = async (db: D1Database) => {
  const drizzleDb = drizzle(db as D1Database, { schema });

  for (const code of unspscData) {
    await drizzleDb.insert(unspscCodes).values({
      segment: code.segment,
      segment_name: code.segment_name,
      family: code.family,
      family_name: code.family_name,
      class: code.class,
      class_name: code.class_name,
      commodity: code.commodity,
      commodity_name: code.commodity_name,
    });
  }

  console.log("Seeding completed.");
};
