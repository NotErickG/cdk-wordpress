import { Construct } from 'constructs';

import { aws_ec2 as ec2 } from 'aws-cdk-lib';


interface StackProps {
  vpc: ec2.IVpc
}

/**
 * Creates the Wordpress EC2 AutoscalingGroup
 *
 * @param  {Construct} scope stack application scope
 * @param  {StackProps} props props needed to create the resource
 *
 */
export class VPCSecurityGroup {
  // export our newly created instance
  public readonly sg: ec2.SecurityGroup;

  constructor(scope: Construct, props: StackProps) {

    const customVPC = props.vpc;
    // lets create a security group for the wordpress instances
    this.sg = new ec2.SecurityGroup(
    scope,
    'wordpress-instances-sg',
    {
        vpc: customVPC,
        allowAllOutbound: true,
        securityGroupName: 'wordpress-instances-sg',
    }
    );

    this.sg.addIngressRule(
    ec2.Peer.ipv4(customVPC.vpcCidrBlock),
    ec2.Port.tcp(80),
    'Allows HTTP access from resources inside our VPC (like the ALB)'
    );
      
  }
}
