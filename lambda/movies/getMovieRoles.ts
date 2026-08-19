import { APIGatewayProxyHandler } from 'aws-lambda';
import { GetCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { ddbDocClient } from '../common/ddbClient';
import { jsonResponse } from '../common/http';
import { logUserRequest } from '../common/logging';
import { toRole } from '../common/mappers';
import { movieKey, roleKey } from '../../shared/keys';

const TABLE_NAME = process.env.TABLE_NAME!;

// GET /movies/{movieID}/roles?[actor=actorID]
export const handler: APIGatewayProxyHandler = async (event) => {
  logUserRequest(event);

  const movieId = Number(event.pathParameters?.movieID);
  if (!Number.isInteger(movieId)) {
    return jsonResponse(400, { message: 'movieID path parameter must be a number' });
  }

  const actorParam = event.queryStringParameters?.actor;

  if (actorParam) {
    const actorId = Number(actorParam);
    if (!Number.isInteger(actorId)) {
      return jsonResponse(400, { message: 'actor query parameter must be a number' });
    }

    const { Item } = await ddbDocClient.send(
      new GetCommand({ TableName: TABLE_NAME, Key: roleKey(movieId, actorId) })
    );

    if (!Item) {
      return jsonResponse(404, { message: `No role found for actor ${actorId} in movie ${movieId}` });
    }

    return jsonResponse(200, toRole(Item));
  }

  const { Items } = await ddbDocClient.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :skPrefix)',
      ExpressionAttributeValues: {
        ':pk': movieKey(movieId).PK,
        ':skPrefix': 'a#',
      },
    })
  );

  return jsonResponse(200, (Items ?? []).map(toRole));
};
