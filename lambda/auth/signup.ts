import { APIGatewayProxyHandler } from 'aws-lambda';
import { SignUpCommand } from '@aws-sdk/client-cognito-identity-provider';
import { cognitoClient, cognitoErrorResponse, USER_POOL_CLIENT_ID } from './cognitoClient';
import { jsonResponse } from '../common/http';
import { SignUpBody } from '../../shared/authTypes';

// POST /auth/signup
export const handler: APIGatewayProxyHandler = async (event) => {
  let body: Partial<SignUpBody>;
  try {
    body = JSON.parse(event.body ?? '{}');
  } catch {
    return jsonResponse(400, { message: 'Request body must be valid JSON' });
  }

  const { username, password, email } = body;

  if (!username?.trim() || !password?.trim() || !email?.trim()) {
    return jsonResponse(400, { message: 'Body must include username, password and email' });
  }

  try {
    await cognitoClient.send(
      new SignUpCommand({
        ClientId: USER_POOL_CLIENT_ID,
        Username: username,
        Password: password,
        UserAttributes: [{ Name: 'email', Value: email }],
      })
    );
  } catch (error) {
    return cognitoErrorResponse(error);
  }

  return jsonResponse(201, {
    message: `User ${username} registered. Check your email for the confirmation code.`,
    username,
  });
};
