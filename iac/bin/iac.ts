#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { IacStack } from "../lib/iac-stack";

const app = new cdk.App();
new IacStack(app, "IacStack", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});
