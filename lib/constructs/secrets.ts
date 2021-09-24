import { Construct } from 'constructs';

import { aws_secretsmanager as secrets } from 'aws-cdk-lib';


interface StackProps {
  prefix: string
  /* the path of the wp admin secret in AWS SM */
  wpSecretName: string
  adminUsername: string
  adminEmail: string
}

/**
 * Creates the Wordpress EC2 AutoscalingGroup
 *
 * @param  {Construct} scope stack application scope
 * @param  {StackProps} props props needed to create the resource
 *
 */
export class WordpressDBSecrets {
  public readonly dbSecret: secrets.Secret

  constructor(scope: Construct, props: StackProps) {

    // secrets for wp admin
    this.dbSecret = new secrets.Secret(scope, props.prefix + 'WordpressAdminSecrets', {
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

  }
}
