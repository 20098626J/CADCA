import { APIGatewayProxyHandler } from 'aws-lambda';
import { GetCommand } from '@aws-sdk/lib-dynamodb';
import { ddbDocClient } from '../common/ddbClient';
import { jsonResponse } from '../common/http';
import { logUserRequest } from '../common/logging';
import { toActor, toRole } from '../common/mappers';
import { actorKey, roleKey } from '../../shared/keys';

const TABLE_NAME = process.env.TABLE_NAME!;

// GET /actors/{actorID}?[movie=movieID]
export const handler: APIGatewayProxyHandler = async (event) => {
  logUserRequest(event);

  const actorId = Number(event.pathParameters?.actorID);
  if (!Number.isInteger(actorId)) {
    return jsonResponse(400, { message: 'actorID path parameter must be a number' });
  }

  const { Item: actorItem } = await ddbDocClient.send(
    new GetCommand({ TableName: TABLE_NAME, Key: actorKey(actorId) })
  );

  if (!actorItem) {
    return jsonResponse(404, { message: `Actor ${actorId} not found` });
  }

  const actor = toActor(actorItem);
  const movieParam = event.queryStringParameters?.movie;

  if (!movieParam) {
    return jsonResponse(200, actor);
  }

  const movieId = Number(movieParam);
  if (!Number.isInteger(movieId)) {
    return jsonResponse(400, { message: 'movie query parameter must be a number' });
  }

  const { Item: roleItem } = await ddbDocClient.send(
    new GetCommand({ TableName: TABLE_NAME, Key: roleKey(movieId, actorId) })
  );

  return jsonResponse(200, {
    ...actor,
    role: roleItem ? toRole(roleItem) : null,
  });
};
