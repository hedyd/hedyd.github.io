import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as iam from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";
import { join } from "path";

export class IacStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Define the Lambda function
    const chatFunction = new lambda.Function(this, "ChatFunction", {
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: "index.handler",
      code: lambda.Code.fromAsset(join(__dirname, "lambdas/chat")),
      initialPolicy: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: ["bedrock:InvokeModel"],
          resources: [
            "arn:aws:bedrock:us-east-1::foundation-model/amazon.nova-micro-v1:0",
          ],
        }),
      ],
    });

    // Define the API Gateway REST API
    const api = new apigateway.LambdaRestApi(this, "ChatAPI", {
      handler: chatFunction,
      proxy: false,
      integrationOptions: {
        timeout: cdk.Duration.seconds(5),
      },
    });
    const usagePlan = api.addUsagePlan("ChatUsagePlan", {
      name: "ChatUsage",
      throttle: {
        rateLimit: 10,
        burstLimit: 2,
      },
      quota: {
        limit: 100,
        period: apigateway.Period.DAY,
      },
    });
    usagePlan.addApiStage({ api, stage: api.deploymentStage });

    // Add API route and CORS
    const chat = api.root.addResource("chat", {
      defaultCorsPreflightOptions: {
        allowOrigins: ["https://hedyd.github.io"],
        allowMethods: ["POST"],
      },
    });
    chat.addMethod("POST");
  }
}
