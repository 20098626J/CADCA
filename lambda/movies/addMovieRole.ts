import { APIGatewayProxyHandler } from 'aws-lambda';
import { GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { ddbDocClient } from '../common/ddbClient';
import { jsonResponse } from '../common/http';
import { logUserRequest } from '../common/logging';
import { toRole } from '../common/mappers';
import { actorKey, movieKey, roleKey } from '../../shared/keys';

const TABLE_NAME = process.env.TABLE_NAME!;

interface AddRoleBody {
  movieId?: unknown;
  actorId?: unknown;
  roleName?: unknown;
  roleDescription?: unknown;
}

// POST /movies/roles
export const handler: APIGatewayProxyHandler = async (event) => {
  logUserRequest(event);

  let body: AddRoleBody;
  try {
    body = JSON.parse(event.body ?? '{}');
  } catch {
    return jsonResponse(400, { message: 'Request body must be valid JSON' });
  }

  const movieId = Number(body.movieId);
  const actorId = Number(body.actorId);
  const { roleName, roleDescription } = body;

  if (
    !Number.isInteger(movieId) ||
    !Number.isInteger(actorId) ||
    typeof roleName !== 'string' ||
    !roleName.trim() ||
    typeof roleDescription !== 'string' ||
    !roleDescription.trim()
  ) {
    return jsonResponse(400, {
      message: 'Body must include numeric movieId, numeric actorId, roleName and roleDescription strings',
    });
  }

  const [{ Item: movieItem }, { Item: actorItem }] = await Promise.all([
    ddbDocClient.send(new GetCommand({ TableName: TABLE_NAME, Key: movieKey(movieId) })),
    ddbDocClient.send(new GetCommand({ TableName: TABLE_NAME, Key: actorKey(actorId) })),
  ]);

  if (!movieItem) {
    return jsonResponse(404, { message: `Movie ${movieId} not found` });
  }
  if (!actorItem) {
    return jsonResponse(404, { message: `Actor ${actorId} not found` });
  }

  const roleItem = {
    ...roleKey(movieId, actorId),
    entityType: 'ROLE',
    movieId,
    actorId,
    roleName,
    roleDescription,
  };

  await ddbDocClient.send(new PutCommand({ TableName: TABLE_NAME, Item: roleItem }));

  return jsonResponse(201, toRole(roleItem));
};
