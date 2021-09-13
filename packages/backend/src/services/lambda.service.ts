import AWS from "aws-sdk";

import { __DEV__ } from "../helpers/const";

const lambda = new AWS.Lambda({
  region: "eu-central-1",
  endpoint: __DEV__ ? "http://localhost:3002" : undefined,
});

export class LambdaService {
  private name: string;

  constructor(name: string) {
    this.name = name;
  }

  async invokeFunction<T extends {}>(payload: T) {
    return await lambda
      .invoke({
        FunctionName: this.name,
        InvocationType: "Event",
        Payload: JSON.stringify(payload),
      })
      .promise();
  }
}
