import { APIGatewayProxyHandler } from 'aws-lambda';
import { InitiateAuthCommand } from '@aws-sdk/client-cognito-identity-provider';
import { cognitoClient, cognitoErrorResponse, USER_POOL_CLIENT_ID } from './cognitoClient';
import { jsonResponse } from '../common/http';
import { SignInBody } from '../../shared/authTypes';

// POST /auth/signin
export const handler: APIGatewayProxyHandler = async (event) => {
  let body: Partial<SignInBody>;
  try {
    body = JSON.parse(event.body ?? '{}');
  } catch {
    return jsonResponse(400, { message: 'Request body must be valid JSON' });
  }

  const { username, password } = body;

  if (!username?.trim() || !password?.trim()) {
    return jsonResponse(400, { message: 'Body must include username and password' });
  }

  try {
    const { AuthenticationResult } = await cognitoClient.send(
      new InitiateAuthCommand({
        ClientId: USER_POOL_CLIENT_ID,
        AuthFlow: 'USER_PASSWORD_AUTH',
        AuthParameters: { USERNAME: username, PASSWORD: password },
      })
    );

    if (!AuthenticationResult?.IdToken) {
      return jsonResponse(401, { message: 'Authentication did not return a token' });
    }

    // The ID token is what the protected endpoints' Cognito authorizer expects
    // in the Authorization header; the access token is needed to sign out.
    return jsonResponse(200, {
      message: `User ${username} signed in`,
      idToken: AuthenticationResult.IdToken,
      accessToken: AuthenticationResult.AccessToken,
      expiresIn: AuthenticationResult.ExpiresIn,
    });
  } catch (error) {
    return cognitoErrorResponse(error);
  }
};
