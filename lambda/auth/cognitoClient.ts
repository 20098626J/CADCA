import { CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider';
import { jsonResponse } from '../common/http';

export const cognitoClient = new CognitoIdentityProviderClient({});

export const USER_POOL_CLIENT_ID = process.env.USER_POOL_CLIENT_ID!;

// Cognito surfaces failures as named exceptions; map the ones a client can
// reasonably act on to meaningful HTTP statuses rather than a blanket 500.
const STATUS_BY_COGNITO_ERROR: Record<string, number> = {
  UsernameExistsException: 409,
  InvalidPasswordException: 400,
  InvalidParameterException: 400,
  CodeMismatchException: 400,
  ExpiredCodeException: 400,
  UserNotFoundException: 404,
  UserNotConfirmedException: 403,
  NotAuthorizedException: 401,
  TooManyRequestsException: 429,
  LimitExceededException: 429,
};

export const cognitoErrorResponse = (error: unknown) => {
  const name = error instanceof Error ? error.name : 'UnknownError';
  const message = error instanceof Error ? error.message : 'Unexpected authentication error';
  const statusCode = STATUS_BY_COGNITO_ERROR[name] ?? 500;

  console.error(`Cognito error ${name}: ${message}`);

  return jsonResponse(statusCode, { message, error: name });
};
