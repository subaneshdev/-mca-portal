import { Company, Director, ComplianceDeadline } from '@/types';

/**
 * DYNAMIC_COMPANIES: In-memory array populated at runtime by MCP tool calls
 * (e.g. create_company). These appear on dashboards immediately without
 * requiring a page reload or DB round-trip.
 */
export const DYNAMIC_COMPANIES: Company[] = [];

/**
 * DYNAMIC_DIRECTORS: In-memory director records created at runtime via MCP.
 * Keyed by company ID for fast lookup.
 */
export const DYNAMIC_DIRECTORS: Map<string, Director[]> = new Map();

/**
 * SeedService — Production-ready no-op.
 * In development, seeding is done through MCP tool calls or the UI.
 */
export class SeedService {
  static async ensureSeeded(): Promise<void> {
    // No-op in production — all data comes from Supabase or MCP runtime
    return;
  }
}
