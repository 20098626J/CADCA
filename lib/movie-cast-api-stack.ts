import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { MovieCastTable } from './constructs/movie-cast-table';
import { MovieCastSeeder } from './constructs/movie-cast-seeder';

export class MovieCastApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const movieCastTable = new MovieCastTable(this, 'MovieCastTable');
    new MovieCastSeeder(this, 'MovieCastSeeder', movieCastTable.table);
  }
}
