import { NextRequest, NextResponse } from 'next/server';

/**
 * RFC 7591 OAuth 2.0 Dynamic Client Registration Protocol
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const clientId = `claude_client_${Math.random().toString(36).substring(2, 12)}`;
    const clientSecret = `sec_${Math.random().toString(36).substring(2, 18)}`;

    return NextResponse.json(
      {
        client_id: clientId,
        client_secret: clientSecret,
        client_name: body.client_name || 'Anthropic Claude Connector',
        redirect_uris: body.redirect_uris || ['https://claude.ai/api/mcp/oauth/callback'],
        grant_types: ['authorization_code', 'refresh_token'],
        response_types: ['code'],
        scope: body.scope || 'mca:read mca:compliance mca:filings'
      },
      {
        status: 201,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        }
      }
    );
  } catch {
    return NextResponse.json({ error: 'invalid_request' }, { status: 400 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}
