import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { MovieCastTable } from './constructs/movie-cast-table';
import { MovieCastSeeder } from './constructs/movie-cast-seeder';
import { MovieCastApi } from './constructs/movie-cast-api';
import { AuthApi } from './constructs/auth-api';

export class MovieCastApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const movieCastTable = new MovieCastTable(this, 'MovieCastTable');
    new MovieCastSeeder(this, 'MovieCastSeeder', movieCastTable.table);

    const authApi = new AuthApi(this, 'AuthApi');

    const movieCastApi = new MovieCastApi(this, 'MovieCastApi', {
      table: movieCastTable.table,
      userPool: authApi.userPool,
    });

    new cdk.CfnOutput(this, 'ApiUrl', { value: movieCastApi.api.url });
    new cdk.CfnOutput(this, 'AdminApiKeyId', {
      value: movieCastApi.adminApiKey.keyId,
      description: 'Retrieve the key value: aws apigateway get-api-key --api-key <id> --include-value',
    });
    new cdk.CfnOutput(this, 'AuthApiUrl', { value: authApi.api.url });
    new cdk.CfnOutput(this, 'UserPoolId', { value: authApi.userPool.userPoolId });
    new cdk.CfnOutput(this, 'UserPoolClientId', {
      value: authApi.userPoolClient.userPoolClientId,
    });
  }
}
