import { APIGatewayProxyHandler } from 'aws-lambda';
import { ConfirmSignUpCommand } from '@aws-sdk/client-cognito-identity-provider';
import { cognitoClient, cognitoErrorResponse, USER_POOL_CLIENT_ID } from './cognitoClient';
import { jsonResponse } from '../common/http';
import { ConfirmSignUpBody } from '../../shared/authTypes';

// POST /auth/confirm_signup
export const handler: APIGatewayProxyHandler = async (event) => {
  let body: Partial<ConfirmSignUpBody>;
  try {
    body = JSON.parse(event.body ?? '{}');
  } catch {
    return jsonResponse(400, { message: 'Request body must be valid JSON' });
  }

  const { username, code } = body;

  if (!username?.trim() || !code?.trim()) {
    return jsonResponse(400, { message: 'Body must include username and code' });
  }

  try {
    await cognitoClient.send(
      new ConfirmSignUpCommand({
        ClientId: USER_POOL_CLIENT_ID,
        Username: username,
        ConfirmationCode: code,
      })
    );
  } catch (error) {
    return cognitoErrorResponse(error);
  }

  return jsonResponse(200, { message: `User ${username} confirmed. You can now sign in.` });
};
