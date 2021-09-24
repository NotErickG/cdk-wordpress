// import * as cdk from '@aws-cdk/core'
import { Construct } from 'constructs';
import { aws_ec2 as ec2 } from 'aws-cdk-lib';

interface StackProps {
  prefix: string
  cidr: string
}

/**
 * Creates a new custom VPC
 *
 * @param  {Construct} scope stack application scope
 * @param  {StackProps} props props needed to create the resource
 *
 */
export class CustomVPC {
  public readonly vpc: ec2.IVpc

  constructor(scope: Construct, props: StackProps) {
    this.vpc = new ec2.Vpc(scope, `${props.prefix}-vpc`, {
      maxAzs: 2, // RDS requires at least 2
      cidr: props.cidr, // the ip address block of the vpc e.g. '172.22.0.0/16'
      enableDnsHostnames: true,
      enableDnsSupport: true,
      natGateways: 0, // expensive -- we don't need that, yet (we have no PRIVATE subnets)
      subnetConfiguration: [
        {
          cidrMask: 22,
          name: `${props.prefix}-public-`,
          subnetType: ec2.SubnetType.PUBLIC,
        },
        {
          cidrMask: 22,
          name: `${props.prefix}-isolated-`,
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
        },
      ],
    })
    
  }
}
