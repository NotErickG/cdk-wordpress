import * as cdk from 'aws-cdk-lib';
import * as CdkWordpress from '../lib/cdk-wordpress-stack';
import { config } from '../lib/config';

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new CdkWordpress.CdkWordpressStack(app, 'MyTestStack', 
    {
        config: config,
    }
    );
    // THEN
    const actual = app.synth().getStackArtifact(stack.artifactId).template;
    expect(actual.Resources ?? {}).toEqual({});
});
