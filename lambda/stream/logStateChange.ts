import { DynamoDBStreamHandler } from 'aws-lambda';
import { unmarshall } from '@aws-sdk/util-dynamodb';

// DynamoDB reports the physical operation; the spec asks for the HTTP verb
// that caused it.
const ACTION_BY_EVENT_NAME: Record<string, string> = {
  INSERT: 'POST',
  MODIFY: 'PUT',
  REMOVE: 'DELETE',
};

// Renders an item as  PK | SK | <name> | <description>, picking the naming
// fields appropriate to the item type stored in the single table.
const describeItem = (item: Record<string, any>): string => {
  const fields: unknown[] = [item.PK, item.SK];

  switch (item.entityType) {
    case 'ROLE':
      fields.push(item.roleName, item.roleDescription);
      break;
    case 'MOVIE':
      fields.push(item.title, item.overview);
      break;
    case 'ACTOR':
      fields.push(item.name, item.bio);
      break;
  }

  return fields.filter((field) => field !== undefined).join(' | ');
};

export const handler: DynamoDBStreamHandler = async (event) => {
  for (const record of event.Records) {
    const action = ACTION_BY_EVENT_NAME[record.eventName ?? ''] ?? record.eventName;

    // A removal only carries the prior state of the item.
    const image =
      record.eventName === 'REMOVE' ? record.dynamodb?.OldImage : record.dynamodb?.NewImage;

    if (!image) {
      continue;
    }

    const item = unmarshall(image as any);
    console.log(`${action} ${describeItem(item)}`);
  }
};
