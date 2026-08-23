import { NextRequest, NextResponse } from 'next/server';
import { MCP_TOOLS, executeMcpTool } from '@/lib/mcp/tools';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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
      docs: '/settings/ai-clients'
    }
  }, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-mcp-version'
    }
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { jsonrpc = '2.0', id, method, params } = body;

    // Handle MCP protocol methods
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
      });
    }

    if (method === 'ping') {
      return NextResponse.json({ jsonrpc: '2.0', id, result: {} });
    }

    if (method === 'tools/list') {
      return NextResponse.json({
        jsonrpc: '2.0',
        id,
        result: {
          tools: MCP_TOOLS
        }
      });
    }

    if (method === 'tools/call') {
      const toolName = params?.name;
      const toolArguments = params?.arguments || {};

      if (!toolName) {
        return NextResponse.json({
          jsonrpc: '2.0',
          id,
          error: { code: -32602, message: 'Missing tool name in params' }
        }, { status: 400 });
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
        return NextResponse.json({
          jsonrpc: '2.0',
          id,
          result: {
            content: [
              {
                type: 'text',
                text: typeof output === 'string' ? output : JSON.stringify(output, null, 2)
              }
            ]
          }
        });
      } catch (err: any) {
        return NextResponse.json({
          jsonrpc: '2.0',
          id,
          error: {
            code: -32000,
            message: err.message || 'Error executing MCP tool'
          }
        });
      }
    }

    return NextResponse.json({
      jsonrpc: '2.0',
      id,
      error: { code: -32601, message: `Method "${method}" not found` }
    }, { status: 404 });

  } catch (error: any) {
    return NextResponse.json({
      jsonrpc: '2.0',
      error: { code: -32700, message: 'Parse error', data: error.message }
    }, { status: 400 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-mcp-version'
    }
  });
}
