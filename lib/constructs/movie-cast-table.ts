import { Construct } from 'constructs';
import { RemovalPolicy } from 'aws-cdk-lib';
import { AttributeType, BillingMode, StreamViewType, Table } from 'aws-cdk-lib/aws-dynamodb';

// Single-table design: Movie, Actor and Role items all live in one table,
// distinguished by their PK/SK prefixes (see shared/keys.ts).
export class MovieCastTable extends Construct {
  public readonly table: Table;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.table = new Table(this, 'Table', {
      tableName: 'MovieCast',
      partitionKey: { name: 'PK', type: AttributeType.STRING },
      sortKey: { name: 'SK', type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY,
      // Enables the state-change logging Lambda to react to POST/DELETE writes.
      stream: StreamViewType.NEW_AND_OLD_IMAGES,
    });
  }
}
