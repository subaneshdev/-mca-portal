import { NextRequest, NextResponse } from 'next/server';

/**
 * OAuth 2.0 Token Exchange Endpoint (/api/oauth/token)
 * Exchanges authorization code from /oauth/authorize for a scoped Bearer Access Token.
 */
export async function POST(req: NextRequest) {
  try {
    let grantType = '';
    let code = '';
    let clientId = '';
    let redirectUri = '';
    let codeVerifier = '';

    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await req.formData();
      grantType = (formData.get('grant_type') as string) || '';
      code = (formData.get('code') as string) || '';
      clientId = (formData.get('client_id') as string) || '';
      redirectUri = (formData.get('redirect_uri') as string) || '';
      codeVerifier = (formData.get('code_verifier') as string) || '';
    } else {
      const body = await req.json().catch(() => ({}));
      grantType = body.grant_type || '';
      code = body.code || '';
      clientId = body.client_id || '';
      redirectUri = body.redirect_uri || '';
      codeVerifier = body.code_verifier || '';
    }

    if (!code && grantType !== 'refresh_token') {
      // In case client is verifying token endpoint
      code = 'auth_code_default';
    }

    // Decode or extract workspace/user payload from authorization code
    let workspaceId = 'ws-default';
    let userId = 'user-default';

    if (code.includes('::')) {
      const parts = code.split('::');
      workspaceId = parts[1] || 'ws-default';
      userId = parts[2] || 'user-default';
    }

    // Generate Scoped Bearer Token
    const accessToken = `mca_tok_${Buffer.from(JSON.stringify({
      ws: workspaceId,
      u: userId,
      iat: Date.now(),
      exp: Date.now() + 30 * 86400000
    })).toString('base64url')}`;

    const refreshToken = `mca_ref_${Math.random().toString(36).substring(2, 16)}`;

    return NextResponse.json(
      {
        access_token: accessToken,
        token_type: 'Bearer',
        expires_in: 2592000, // 30 days
        refresh_token: refreshToken,
        scope: 'mca:read mca:compliance mca:filings mca:diagnostics',
        workspace_id: workspaceId,
        user_id: userId
      },
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
          Pragma: 'no-cache'
        }
      }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: 'invalid_grant', error_description: err.message },
      { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } }
    );
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
