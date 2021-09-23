import * as cdk from 'aws-cdk-lib';
import * as CdkWordpress from '../lib/cdk-wordpress-stack';

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new CdkWordpress.CdkWordpressStack(app, 'MyTestStack');
    // THEN
    const actual = app.synth().getStackArtifact(stack.artifactId).template;
    expect(actual.Resources ?? {}).toEqual({});
});
