import { NextRequest, NextResponse } from 'next/server';
import { GET as mcpGET, POST as mcpPOST, OPTIONS as mcpOPTIONS } from '@/app/api/mcp/route';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Standard /mcp route alias forwarding to /api/mcp.
 * Many MCP clients expect the server at /mcp rather than /api/mcp.
 */
export async function GET(request: NextRequest) {
  return mcpGET(request);
}

export async function POST(request: NextRequest) {
  return mcpPOST(request);
}

export async function OPTIONS() {
  return mcpOPTIONS();
}
