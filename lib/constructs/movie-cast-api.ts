import { Construct } from 'constructs';
import * as path from 'path';
import { Duration } from 'aws-cdk-lib';
import { Cors, LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';

interface MovieCastApiProps {
  table: Table;
}

// Endpoints are unauthenticated for now; Cognito/API-key authorization is
// layered on in a later stage of the build.
export class MovieCastApi extends Construct {
  public readonly api: RestApi;

  constructor(scope: Construct, id: string, props: MovieCastApiProps) {
    super(scope, id);

    const { table } = props;

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

    const movies = this.api.root.addResource('movies');
    movies.addResource('roles').addMethod('POST', new LambdaIntegration(addMovieRoleFn));

    const rolesForMovie = movies.addResource('{movieID}').addResource('roles');
    rolesForMovie.addMethod('GET', new LambdaIntegration(getMovieRolesFn));
    rolesForMovie.addResource('{actorID}').addMethod('DELETE', new LambdaIntegration(deleteMovieRoleFn));

    const actors = this.api.root.addResource('actors');
    actors.addResource('{actorID}').addMethod('GET', new LambdaIntegration(getActorFn));
  }
}
