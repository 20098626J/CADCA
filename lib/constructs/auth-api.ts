import { Construct } from 'constructs';
import * as path from 'path';
import { Duration, RemovalPolicy } from 'aws-cdk-lib';
import { Cors, EndpointType, LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { IUserPool, UserPool, UserPoolClient } from 'aws-cdk-lib/aws-cognito';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';

// A dedicated Auth API (separate from the app API) handling self-registration,
// sign-in and sign-out against a Cognito user pool.
export class AuthApi extends Construct {
  public readonly api: RestApi;
  public readonly userPool: IUserPool;
  public readonly userPoolClient: UserPoolClient;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    const userPool = new UserPool(this, 'UserPool', {
      signInAliases: { username: true, email: true },
      selfSignUpEnabled: true,
      removalPolicy: RemovalPolicy.DESTROY,
    });
    this.userPool = userPool;

    this.userPoolClient = userPool.addClient('AppClient', {
      authFlows: { userPassword: true },
    });

    this.api = new RestApi(this, 'AuthServiceApi', {
      restApiName: 'Auth API',
      description: 'Authentication Service RestApi',
      endpointTypes: [EndpointType.REGIONAL],
      defaultCorsPreflightOptions: {
        allowOrigins: Cors.ALL_ORIGINS,
        allowMethods: Cors.ALL_METHODS,
      },
    });

    const authResource = this.api.root.addResource('auth');

    const addAuthRoute = (routeName: string, entryFile: string) => {
      const fn = new NodejsFunction(this, `${entryFile.replace(/\W/g, '')}Fn`, {
        entry: path.join(__dirname, '../../lambda/auth', entryFile),
        runtime: Runtime.NODEJS_20_X,
        timeout: Duration.seconds(10),
        memorySize: 256,
        environment: { USER_POOL_CLIENT_ID: this.userPoolClient.userPoolClientId },
        bundling: { externalModules: ['@aws-sdk/*'] },
      });

      authResource.addResource(routeName).addMethod('POST', new LambdaIntegration(fn));
    };

    addAuthRoute('signup', 'signup.ts');
    addAuthRoute('confirm_signup', 'confirmSignup.ts');
    addAuthRoute('signin', 'signin.ts');
    addAuthRoute('signout', 'signout.ts');
  }
}
