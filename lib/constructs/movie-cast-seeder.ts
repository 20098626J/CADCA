import { Construct } from 'constructs';
import { AwsCustomResource, AwsCustomResourcePolicy, PhysicalResourceId } from 'aws-cdk-lib/custom-resources';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import { actorKey, movieKey, roleKey } from '../../shared/keys';
import { SEED_ACTORS, SEED_MOVIES, SEED_ROLES } from './seed-data';

// Movies and actors have no create endpoint in this API (only roles do),
// so the table is seeded at deploy time via a custom resource instead.
export class MovieCastSeeder extends Construct {
  constructor(scope: Construct, id: string, table: Table) {
    super(scope, id);

    const putRequests = [
      ...SEED_MOVIES.map((movie) => ({
        PutRequest: { Item: marshall({ ...movieKey(movie.movieId), entityType: 'MOVIE', ...movie }) },
      })),
      ...SEED_ACTORS.map((actor) => ({
        PutRequest: { Item: marshall({ ...actorKey(actor.actorId), entityType: 'ACTOR', ...actor }) },
      })),
      ...SEED_ROLES.map((role) => ({
        PutRequest: {
          Item: marshall({ ...roleKey(role.movieId, role.actorId), entityType: 'ROLE', ...role }),
        },
      })),
    ];

    const batchWriteCall = {
      service: 'DynamoDB',
      action: 'batchWriteItem',
      parameters: { RequestItems: { [table.tableName]: putRequests } },
      physicalResourceId: PhysicalResourceId.of(`${table.tableName}-seed`),
    };

    new AwsCustomResource(this, 'Resource', {
      onCreate: batchWriteCall,
      onUpdate: batchWriteCall,
      policy: AwsCustomResourcePolicy.fromSdkCalls({ resources: [table.tableArn] }),
    });
  }
}
