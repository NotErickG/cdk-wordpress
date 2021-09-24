import { Construct } from 'constructs';

import { aws_ec2 as ec2 } from 'aws-cdk-lib';
import { aws_autoscaling as autoscaling } from 'aws-cdk-lib';

import { WordpressApplicationLoadBalancer } from './alb'
import { WordpressAutoScalingGroup } from './ec2'

interface StackProps {
  projectName: string
  vpc: ec2.IVpc
  /* the path of the db access secret in AWS SM */
  dbSecretName: string 
  /* the path of the wp admin secret in AWS SM */
  wpSecretName: string
  adminUsername: string
  adminEmail: string
  installPath: string
  siteTitle: string
  databaseName: string
  region: string

}

/**
 * Creates the Wordpress EC2 AutoscalingGroup
 *
 * @param  {Construct} scope stack application scope
 * @param  {StackProps} props props needed to create the resource
 *
 */
export class WordpressProject {
  // export our newly created instance
  public readonly wp: autoscaling.AutoScalingGroup

  constructor(scope: Construct, props: StackProps) {
    // use the vpc we just created
    const customVPC = props.vpc
    const projectName = props.projectName;
    
    // Application Loadbalancer -- for our single instance
    const { loadBalancerDnsName, listener } = new WordpressApplicationLoadBalancer(scope, {
        prefix: projectName,
        vpc: customVPC,
    })

    // EC2 -- create the Wordpress instance in an autoscaling group
    const { asg } = new WordpressAutoScalingGroup(scope, {
        prefix: projectName,
        vpc: customVPC,
        dnsName: loadBalancerDnsName,
        dbSecretName: `${projectName}/rds/mysql/credentials`,
        wpSecretName: `${projectName}/wordpress/admin/credentials`,
        adminEmail: props.adminEmail,
        adminUsername: props.adminUsername,
        databaseName: props.databaseName,
        installPath: props.installPath,
        region: props.region,
        siteTitle: props.siteTitle,
    })

    // lets add our autoscaling group to our load balancer
    listener.addTargets(`${projectName}-wp-asg-targets`, {
        port: 80,
        targets: [asg]
    })

    
  }
}
