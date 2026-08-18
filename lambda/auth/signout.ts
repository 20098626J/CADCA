import { APIGatewayProxyHandler } from 'aws-lambda';
import { GlobalSignOutCommand } from '@aws-sdk/client-cognito-identity-provider';
import { cognitoClient, cognitoErrorResponse } from './cognitoClient';
import { jsonResponse } from '../common/http';

// POST /auth/signout
// Requires the *access* token (not the ID token) returned by /auth/signin,
// supplied either as a bearer Authorization header or in the request body.
export const handler: APIGatewayProxyHandler = async (event) => {
  const authHeader = event.headers?.Authorization ?? event.headers?.authorization;
  const bearerToken = authHeader?.replace(/^Bearer\s+/i, '').trim();

  let bodyToken: string | undefined;
  try {
    bodyToken = JSON.parse(event.body ?? '{}').accessToken;
  } catch {
    return jsonResponse(400, { message: 'Request body must be valid JSON' });
  }

  const accessToken = bearerToken || bodyToken;

  if (!accessToken) {
    return jsonResponse(400, {
      message: 'Provide the access token via an Authorization header or an accessToken body field',
    });
  }

  try {
    await cognitoClient.send(new GlobalSignOutCommand({ AccessToken: accessToken }));
  } catch (error) {
    return cognitoErrorResponse(error);
  }

  return jsonResponse(200, { message: 'Signed out' });
};
