import { Construct } from 'constructs';
import * as path from 'path';
import { Duration } from 'aws-cdk-lib';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { Runtime, StartingPosition } from 'aws-cdk-lib/aws-lambda';
import { DynamoEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';

// Poll-based integration: the Lambda service polls the table's stream and
// invokes this function with a batch of change records, which it writes to
// CloudWatch as an audit trail of database state changes.
export class StateChangeLogger extends Construct {
  constructor(scope: Construct, id: string, table: Table) {
    super(scope, id);

    const logStateChangeFn = new NodejsFunction(this, 'LogStateChangeFn', {
      entry: path.join(__dirname, '../../lambda/stream/logStateChange.ts'),
      runtime: Runtime.NODEJS_20_X,
      timeout: Duration.seconds(10),
      memorySize: 256,
      bundling: { externalModules: ['@aws-sdk/*'] },
    });

    logStateChangeFn.addEventSource(
      new DynamoEventSource(table, {
        startingPosition: StartingPosition.LATEST,
        batchSize: 10,
        retryAttempts: 2,
      })
    );
  }
}
