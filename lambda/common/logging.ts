import { APIGatewayProxyEvent } from 'aws-lambda';

// Writes one CloudWatch entry per request naming the requester and the path
// they hit, e.g.  doconnor /movies/1234/roles
//
// GET requests carry Cognito claims injected by the user pool authorizer.
// Write requests are authorised by the admin API key instead, so they have no
// Cognito identity to report.
export const logUserRequest = (event: APIGatewayProxyEvent): void => {
  const claims = event.requestContext.authorizer?.claims;
  const requester =
    claims?.['cognito:username'] ??
    (event.requestContext.identity?.apiKeyId ? 'administrator' : 'anonymous');

  const params = Object.entries(event.queryStringParameters ?? {}).filter(
    (entry): entry is [string, string] => entry[1] !== undefined
  );
  const queryString = params.length > 0 ? `?${new URLSearchParams(params).toString()}` : '';

  console.log(`${requester} ${event.path}${queryString}`);
};
