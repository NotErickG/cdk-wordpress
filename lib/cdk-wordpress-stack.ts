import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CustomVPC } from './constructs/vpc'
import { MySQLRdsInstance } from './constructs/rds'
import { WordpressProject } from './constructs/wordpress'
import { VPCSecurityGroup } from './constructs/SecurityGroup'

interface MultiStackProps extends StackProps {
  config: any;
}


export class CdkWordpressStack extends Stack {
  constructor(scope: Construct, id: string, props: MultiStackProps) {
    super(scope, id, props);
    const config = props.config 
    // VPC -- fetch the custom VPC
    const customVPC = new CustomVPC(this, {
      prefix: config.projectName,
      cidr: '172.22.0.0/16',
    })

    // RDS -- create the mysql database
    new MySQLRdsInstance(this, {
      prefix: config.projectName,
      vpc: customVPC.vpc,
      user: 'wordpress_admin',
      database: 'awesome-wp-site-db',
      port: 3306,
      // DB credentials will be saved under this pathname in AWS Secrets Manager
      secretName: `${config.projectName}/rds/mysql/credentials`, // secret pathname
    })

    

    // EC2 -- create the Wordpress instance in an autoscaling group
    new VPCSecurityGroup(this, {
      vpc: customVPC.vpc,
    });



    // EC2 -- create the Wordpress instance in an autoscaling group
    new WordpressProject(this, {
      projectName: config.projectName,
      vpc: customVPC.vpc,
      dbSecretName: `${config.projectName}/rds/mysql/credentials`,
      wpSecretName: `${config.projectName}/wordpress/admin/credentials`,
      adminEmail: config.wordpress.admin.email,
      siteTitle: config.wordpress.site.title,
      region: config.env.region,
      installPath: config.wordpress.site.installPath,
      databaseName: config.wordpress.site.databaseName,
      adminUsername: config.wordpress.admin.username,
    })

  }
}
