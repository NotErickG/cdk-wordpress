import * as fs from 'fs'
import { Construct } from 'constructs';

import { aws_ec2 as ec2 } from 'aws-cdk-lib';
import { aws_secretsmanager as secrets } from 'aws-cdk-lib';
import { aws_autoscaling as autoscaling } from 'aws-cdk-lib';
import { aws_iam as iam } from 'aws-cdk-lib';

import { replaceAllSubstrings } from '../utils'
import { apexDomain } from 'aws-cdk-lib/lib/aws-certificatemanager';

interface StackProps {
  prefix: string
  vpc: ec2.IVpc
  /* the dns name of the ALB */
  dnsName: string
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
export class WordpressAutoScalingGroup {
  // export our newly created instance
  public readonly asg: autoscaling.AutoScalingGroup

  constructor(scope: Construct, props: StackProps) {
    // use the vpc we just created
    const customVPC = props.vpc

    // define a role for the wordpress instances
    const role = new iam.Role(scope, `${props.prefix}-instance-role`, {
      assumedBy: new iam.CompositePrincipal(
        new iam.ServicePrincipal('ec2.amazonaws.com'),
        new iam.ServicePrincipal('ssm.amazonaws.com')
      ),
      managedPolicies: [
        // allows us to access instance via SSH using IAM and SSM
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          'AmazonSSMManagedInstanceCore'
        ),
        // allows ec2 instance to access secrets maanger and retrieve secrets
        iam.ManagedPolicy.fromAwsManagedPolicyName('SecretsManagerReadWrite'),
      ],
    })


    // secrets for wp admin
    new secrets.Secret(scope, 'WordpressAdminSecrets', {
      secretName: props.wpSecretName,
      description: 'Admin credentials to access Wordpress',
      generateSecretString: {
        secretStringTemplate: JSON.stringify({
          username: props.adminUsername,
          email: props.adminEmail,
        }),
        generateStringKey: 'password',
      },
    })

    // Fetch the user script from file system as a string
    const userScript = fs.readFileSync(
      'lib/scripts/wordpress_install.sh',
      'utf8'
    )

    // Replace the following variable substrings in userScript
    const modifiedUserScript = replaceAllSubstrings(
      [
        { _DB_SECRETS_PATH_: props.dbSecretName },
        { _WP_SECRETS_PATH_: props.wpSecretName },
        { _AWS_REGION_: props.region },
        { _WP_DB_NAME_: props.databaseName },
        { _WP_SITE_TITLE_: props.siteTitle },
        { _WP_SITE_INSTALL_PATH_: props.installPath },
        { _WP_SITE_BASE_DOMAIN_: props.dnsName }, // our load balancer dns name
      ],
      userScript
    )

    // finally create and export out autoscaling group
    this.asg = new autoscaling.AutoScalingGroup(scope, `${props.prefix}-asg`, {
      vpc: customVPC,
      role,
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T2,
        ec2.InstanceSize.MICRO
      ),
      machineImage: ec2.MachineImage.latestAmazonLinux({
        generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
      }),
      userData: ec2.UserData.custom(modifiedUserScript),
      // we only want one instance in our ASG
      minCapacity: 1,
      maxCapacity: 1,
      associatePublicIpAddress: true,
      vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
    })
  }
}
