import { APIGatewayProxyHandler } from 'aws-lambda';
import { DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { ddbDocClient } from '../common/ddbClient';
import { jsonResponse } from '../common/http';
import { logUserRequest } from '../common/logging';
import { toRole } from '../common/mappers';
import { roleKey } from '../../shared/keys';

const TABLE_NAME = process.env.TABLE_NAME!;

// DELETE /movies/{movieID}/roles/{actorID}
export const handler: APIGatewayProxyHandler = async (event) => {
  logUserRequest(event);

  const movieId = Number(event.pathParameters?.movieID);
  const actorId = Number(event.pathParameters?.actorID);

  if (!Number.isInteger(movieId) || !Number.isInteger(actorId)) {
    return jsonResponse(400, { message: 'movieID and actorID path parameters must be numbers' });
  }

  const { Attributes } = await ddbDocClient.send(
    new DeleteCommand({
      TableName: TABLE_NAME,
      Key: roleKey(movieId, actorId),
      ReturnValues: 'ALL_OLD',
    })
  );

  if (!Attributes) {
    return jsonResponse(404, { message: `No role found for actor ${actorId} in movie ${movieId}` });
  }

  return jsonResponse(200, { message: 'Role deleted', role: toRole(Attributes) });
};
