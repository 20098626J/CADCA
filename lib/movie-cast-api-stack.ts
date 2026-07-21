import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { MovieCastTable } from './constructs/movie-cast-table';

export class MovieCastApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const movieCastTable = new MovieCastTable(this, 'MovieCastTable');
  }
}
