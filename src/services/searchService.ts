// src/services/searchService.ts
import { Context, Hono } from "hono";
import { z } from "zod";
import { like, or, eq, and, asc } from "drizzle-orm";
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
  // Get UNSPSC codes by query
  async getUnspscCodesByQuery(
    c: Context,
    query: string,
    selectedVersion: string,
    pageSize: string | number,
    offset: string | number
  ) {
    let searchQuery = c.var.db
      .select()
      .from(unspscCodes)
      .leftJoin(unspscVersions, eq(unspscVersions.id, unspscCodes.version));

    if (/^-?\d+$/.test(query)) {
      searchQuery.where(
        or(
          like(unspscCodes.segment, `${query}%`),
          like(unspscCodes.family, `${query}%`),
          like(unspscCodes.class, `${query}%`),
          like(unspscCodes.commodity, `${query}%`)
        ),
        and(eq(unspscCodes.version, selectedVersion))
      );
    } else {
      searchQuery.where(
        or(
          like(unspscCodes.segmentName, `%${query}%`),
          like(unspscCodes.familyName, `%${query}%`),
          like(unspscCodes.className, `%${query}%`),
          like(unspscCodes.commodityName, `%${query}%`)
        ),
        and(eq(unspscCodes.version, selectedVersion))
      );
    }

    return await searchQuery.limit(pageSize).offset(offset);
  }

  async getUnspscCodesHierarchy(
    c: Context,
    selectedVersion: string,
    segment?: string,
    family?: string,
    classCode?: string | null,
    limit?: string | number,
    offset?: string | number
  ) {
    let query = c.var.db
      .select()
      .from(unspscCodes)
      .leftJoin(unspscVersions, eq(unspscVersions.id, unspscCodes.version))
      .where(eq(unspscVersions.version, selectedVersion));

    // Apply optional filters
    if (segment) query = query.where(eq(unspscCodes.segment, segment));
    if (family) query = query.where(eq(unspscCodes.family, family));
    if (classCode) query = query.where(eq(unspscCodes.class, classCode));

    // Apply pagination
    return await query.limit(limit).offset(offset);
  }
}

export default SearchService;
