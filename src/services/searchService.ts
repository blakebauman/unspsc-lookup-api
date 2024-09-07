// src/services/searchService.ts
import { Context, Hono } from "hono";
import { z } from "zod";
import { like, or, eq, and } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import { unspscCodes, unspscVersions } from "../db/schema";

interface SearchServiceModel {
  segment: string;
  segmentName: string;
  family: string;
  familyName: string;
  class: string;
  className: string;
  commodity: string;
  commodityName: string;
  version: string;
}

class SearchService {
  // Get UNSPSC codes by number
  async getByNumber(
    c: Context,
    code: string,
    selectedVersion: string,
    pageSize: number,
    offset: number
  ) {
    return await c.var.db
      .select()
      .from(unspscCodes)
      .leftJoin(unspscVersions, eq(unspscVersions.id, unspscCodes.version))
      .where(
        or(
          like(unspscCodes.segment, `${code}%`),
          like(unspscCodes.family, `${code}%`),
          like(unspscCodes.class, `${code}%`),
          like(unspscCodes.commodity, `${code}%`)
        ),
        and(eq(unspscCodes.version, selectedVersion))
      )
      .limit(pageSize)
      .offset(offset);
  }

  // Get UNSPSC codes by name
  async getByName(
    c: Context,
    name: string,
    selectedVersion: string,
    pageSize: number,
    offset: number
  ) {
    return await await c.var.db
      .select()
      .from(unspscCodes)
      .leftJoin(unspscVersions, eq(unspscVersions.id, unspscCodes.version))
      .where(
        or(
          like(unspscCodes.segmentName, `%${name}%`),
          like(unspscCodes.familyName, `%${name}%`),
          like(unspscCodes.className, `%${name}%`),
          like(unspscCodes.commodityName, `%${name}%`)
        ),
        and(eq(unspscCodes.version, selectedVersion))
      )
      .limit(pageSize)
      .offset(offset);
  }
}

export default SearchService;
