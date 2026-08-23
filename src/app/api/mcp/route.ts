import { NextRequest, NextResponse } from 'next/server';
import { MCP_TOOLS, executeMcpTool } from '@/lib/mcp/tools';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-mcp-version, mcp-session-id, baggage, sentry-trace',
  'Content-Type': 'application/json'
};

export async function GET(request: NextRequest) {
  return NextResponse.json({
    jsonrpc: '2.0',
    server: {
      name: 'future-mca-mcp-server',
      version: '1.0.0',
      description: 'Future MCA Remote Model Context Protocol Server for Autonomous Corporate Compliance Agents',
      tagline: 'Government services, ready for humans and AI agents.',
      auth_type: 'OAuth 2.1 / Bearer Scoped'
    },
    capabilities: {
      tools: {
        listChanged: false
      },
      resources: {},
      prompts: {}
    },
    tools: MCP_TOOLS,
    endpoints: {
      mcp_rpc: '/api/mcp',
      docs: '/connect-ai'
    }
  }, {
    headers: CORS_HEADERS
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { jsonrpc = '2.0', id = null, method, params } = body;

    // Handle MCP protocol handshake & notifications
    if (method === 'initialize') {
      return NextResponse.json({
        jsonrpc: '2.0',
        id,
        result: {
          protocolVersion: '2024-11-05',
          serverInfo: {
            name: 'future-mca-mcp-server',
            version: '1.0.0'
          },
          capabilities: {
            tools: {
              listChanged: false
            }
          }
        }
      }, { headers: CORS_HEADERS });
    }

    if (method === 'notifications/initialized' || method?.startsWith('notifications/')) {
      // MCP notifications do not require a result body, return 200 OK
      return NextResponse.json({ jsonrpc: '2.0', id, result: {} }, { headers: CORS_HEADERS });
    }

    if (method === 'ping') {
      return NextResponse.json({ jsonrpc: '2.0', id, result: {} }, { headers: CORS_HEADERS });
    }

    if (method === 'tools/list') {
      return NextResponse.json({
        jsonrpc: '2.0',
        id,
        result: {
          tools: MCP_TOOLS
        }
      }, { headers: CORS_HEADERS });
    }

    if (method === 'tools/call') {
      const toolName = params?.name;
      const toolArguments = params?.arguments || {};

      if (!toolName) {
        return NextResponse.json({
          jsonrpc: '2.0',
          id,
          result: {
            content: [{ type: 'text', text: 'Error: Missing tool name in params' }],
            isError: true
          }
        }, { headers: CORS_HEADERS });
      }

      // Extract OAuth Bearer token if provided
      let workspaceId: string | undefined = undefined;
      let userId: string | undefined = undefined;
      const authHeader = request.headers.get('authorization') || '';

      if (authHeader.startsWith('Bearer ')) {
        const token = authHeader.replace('Bearer ', '').trim();
        if (token.startsWith('mca_tok_')) {
          try {
            const rawPayload = Buffer.from(token.replace('mca_tok_', ''), 'base64url').toString('utf-8');
            const parsed = JSON.parse(rawPayload);
            workspaceId = parsed.ws;
            userId = parsed.u;
          } catch {
            // fallback token parse
          }
        }
      }

      try {
        const output = await executeMcpTool(toolName, toolArguments, { workspaceId, userId });
        const isErrorOutput = output && typeof output === 'object' && 'error' in output;

        return NextResponse.json({
          jsonrpc: '2.0',
          id,
          result: {
            content: [
              {
                type: 'text',
                text: typeof output === 'string' ? output : JSON.stringify(output, null, 2)
              }
            ],
            isError: isErrorOutput
          }
        }, { headers: CORS_HEADERS });
      } catch (err: any) {
        // Return structured MCP isError content so Claude can read the error message gracefully
        return NextResponse.json({
          jsonrpc: '2.0',
          id,
          result: {
            content: [
              {
                type: 'text',
                text: `Error executing ${toolName}: ${err.message || 'Unknown database error'}`
              }
            ],
            isError: true
          }
        }, { headers: CORS_HEADERS });
      }
    }

    return NextResponse.json({
      jsonrpc: '2.0',
      id,
      error: { code: -32601, message: `Method "${method}" not found` }
    }, { status: 404, headers: CORS_HEADERS });

  } catch (error: any) {
    return NextResponse.json({
      jsonrpc: '2.0',
      id: null,
      error: { code: -32700, message: 'Parse error', data: error.message }
    }, { status: 400, headers: CORS_HEADERS });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS
  });
}
