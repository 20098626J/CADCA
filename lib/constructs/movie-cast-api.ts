import { Construct } from 'constructs';
import * as path from 'path';
import { Duration } from 'aws-cdk-lib';
import {
  ApiKey,
  AuthorizationType,
  CognitoUserPoolsAuthorizer,
  Cors,
  LambdaIntegration,
  MethodOptions,
  RestApi,
  UsagePlan,
} from 'aws-cdk-lib/aws-apigateway';
import { IUserPool } from 'aws-cdk-lib/aws-cognito';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';

interface MovieCastApiProps {
  table: Table;
  userPool: IUserPool;
}

// Authorization model required by the spec:
//   GET            -> any authenticated user (Cognito user pool authorizer)
//   POST / DELETE  -> the administrator only (API Gateway API key)
export class MovieCastApi extends Construct {
  public readonly api: RestApi;
  public readonly adminApiKey: ApiKey;

  constructor(scope: Construct, id: string, props: MovieCastApiProps) {
    super(scope, id);

    const { table, userPool } = props;

    const makeFunction = (name: string, entryFile: string) =>
      new NodejsFunction(this, name, {
        entry: path.join(__dirname, '../../lambda', entryFile),
        runtime: Runtime.NODEJS_20_X,
        timeout: Duration.seconds(10),
        memorySize: 256,
        environment: { TABLE_NAME: table.tableName },
        bundling: { externalModules: ['@aws-sdk/*'] },
      });

    const getMovieRolesFn = makeFunction('GetMovieRolesFn', 'movies/getMovieRoles.ts');
    table.grantReadData(getMovieRolesFn);

    const getActorFn = makeFunction('GetActorFn', 'actors/getActor.ts');
    table.grantReadData(getActorFn);

    const addMovieRoleFn = makeFunction('AddMovieRoleFn', 'movies/addMovieRole.ts');
    table.grantReadWriteData(addMovieRoleFn);

    const deleteMovieRoleFn = makeFunction('DeleteMovieRoleFn', 'movies/deleteMovieRole.ts');
    table.grantWriteData(deleteMovieRoleFn);

    this.api = new RestApi(this, 'RestApi', {
      restApiName: 'Movie Cast API',
      defaultCorsPreflightOptions: {
        allowOrigins: Cors.ALL_ORIGINS,
        allowMethods: Cors.ALL_METHODS,
      },
    });

    // Reads: signed-in users present their Cognito ID token as a bearer token.
    const userAuthorizer = new CognitoUserPoolsAuthorizer(this, 'UserAuthorizer', {
      cognitoUserPools: [userPool],
    });

    const authenticatedUser: MethodOptions = {
      authorizer: userAuthorizer,
      authorizationType: AuthorizationType.COGNITO,
    };

    // Writes: the administrator presents an API key in the x-api-key header.
    const administratorOnly: MethodOptions = { apiKeyRequired: true };

    const movies = this.api.root.addResource('movies');
    movies
      .addResource('roles')
      .addMethod('POST', new LambdaIntegration(addMovieRoleFn), administratorOnly);

    const rolesForMovie = movies.addResource('{movieID}').addResource('roles');
    rolesForMovie.addMethod('GET', new LambdaIntegration(getMovieRolesFn), authenticatedUser);
    rolesForMovie
      .addResource('{actorID}')
      .addMethod('DELETE', new LambdaIntegration(deleteMovieRoleFn), administratorOnly);

    const actors = this.api.root.addResource('actors');
    actors.addResource('{actorID}').addMethod('GET', new LambdaIntegration(getActorFn), authenticatedUser);

    // An API key only takes effect once it is associated with a usage plan
    // that covers the deployed stage.
    this.adminApiKey = new ApiKey(this, 'AdminApiKey', {
      description: 'Administrator key for Movie Cast API write operations',
    });

    const usagePlan = new UsagePlan(this, 'AdminUsagePlan', {
      name: 'MovieCastAdminPlan',
      apiStages: [{ api: this.api, stage: this.api.deploymentStage }],
    });
    usagePlan.addApiKey(this.adminApiKey);
  }
}
