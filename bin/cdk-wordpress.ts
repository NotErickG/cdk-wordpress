#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CdkWordpressStack } from '../lib/cdk-wordpress-stack';
import { config } from '../lib/config';

const app = new cdk.App();
new CdkWordpressStack(app, 'CdkWordpressStack2', {
  env: config.env,
  description: 'Deploys resources for RDS and S3 powered Wordpress Infrastructure',
  tags: { Project: config.projectName, Deployedby: config.deployedBy } 
});