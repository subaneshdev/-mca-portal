import { NextRequest, NextResponse } from 'next/server';
import { MCP_TOOLS, executeMcpTool } from '@/lib/mcp/tools';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-mcp-version, mcp-session-id, x-mcp-client, baggage, sentry-trace',
  'Content-Type': 'application/json'
};

export async function GET(request: NextRequest) {
  return NextResponse.json({
    jsonrpc: '2.0',
    server: {
      name: 'future-mca-mcp-server',
      version: '2.0.0',
      description: 'Future MCA Remote Model Context Protocol Server with Autonomous Post-Action Capabilities',
      tagline: 'Ask AI to securely get things done for your company.',
      capabilities_level: {
        level_1: 'Read Tools (Safe, immediate contextual retrieval)',
        level_2: 'Prepare Tools (Drafting & preview generation, zero direct mutation)',
        level_3: 'Lifecycle & Execution (Explicit confirmation, DSC/Board authorization, idempotent execution)'
      },
      auth_type: 'OAuth 2.1 / Bearer Scoped / Workspace Isolation'
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
      actions_hub: '/actions',
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
            version: '2.0.0'
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

      // Extract client info and OAuth Bearer token if provided
      let workspaceId: string | undefined = undefined;
      let userId: string | undefined = undefined;
      const authHeader = request.headers.get('authorization') || '';
      const userAgent = request.headers.get('user-agent') || '';
      const customClient = request.headers.get('x-mcp-client') || '';

      let clientName = 'Custom Agent';
      let clientType = 'MCP_CLIENT';

      if (customClient) {
        clientName = customClient;
      } else if (userAgent.toLowerCase().includes('claude')) {
        clientName = 'Claude Desktop / Code';
        clientType = 'Anthropic Claude';
      } else if (userAgent.toLowerCase().includes('cursor')) {
        clientName = 'Cursor AI IDE';
        clientType = 'Cursor Agent';
      } else if (userAgent.toLowerCase().includes('chatgpt') || userAgent.toLowerCase().includes('openai')) {
        clientName = 'ChatGPT';
        clientType = 'OpenAI Custom GPT';
      } else if (userAgent.toLowerCase().includes('antigravity')) {
        clientName = 'Antigravity IDE';
        clientType = 'Google Antigravity';
      }

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
        const output = await executeMcpTool(toolName, toolArguments, {
          workspaceId,
          userId,
          actorType: 'AI_CLIENT',
          clientName,
          clientType
        });
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
