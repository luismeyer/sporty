import AWS from "aws-sdk";

import { stateMachineRoleArn, queueLambdaArn } from "./const";
import { timer } from "./timer";

const stepFunctions = new AWS.StepFunctions({ region: "eu-central-1" });

const definition = (timeInMS: number) =>
  JSON.stringify({
    Comment: "State Machine for qify",
    StartAt: "Wait",
    States: {
      Wait: {
        Comment:
          "A Wait state delays the state machine from continuing for a specified time.",
        Type: "Wait",
        Seconds: Math.floor(timeInMS / 1000) - 10,
        Next: "Invoke",
      },
      Invoke: {
        Type: "Task",
        Resource: "arn:aws:states:::lambda:invoke",
        Parameters: {
          FunctionName: queueLambdaArn,
          InvocationType: "Event",
          Payload: {
            "session.$": "$",
          },
        },
        End: true,
      },
    },
  });

const createStateMachineName = (session: string) => session + "stepfc";

const startStateMachine = (arn: string, session: string) => {
  return stepFunctions
    .startExecution({
      stateMachineArn: arn,
      input: session,
    })
    .promise();
};

export const stateMachineArn = async (session: string) => {
  const machineName = createStateMachineName(session);

  let listMachinesResult = await stepFunctions.listStateMachines().promise();
  let machines = listMachinesResult.stateMachines;

  while (listMachinesResult.nextToken) {
    machines = [...machines, ...listMachinesResult.stateMachines];

    listMachinesResult = await stepFunctions
      .listStateMachines({ nextToken: listMachinesResult.nextToken })
      .promise();
  }

  return machines.find((machine) => machine.name === machineName)
    ?.stateMachineArn;
};

export const createStateMachine = async (
  session: string,
  timeInMS: number
): Promise<string> => {
  const machineDefinition = definition(timeInMS);

  const result = await stepFunctions
    .createStateMachine({
      definition: machineDefinition,
      name: createStateMachineName(session),
      roleArn: stateMachineRoleArn,
    })
    .promise();

  await startStateMachine(result.stateMachineArn, session);

  return "success";
};

export const updateStateMachine = async (
  session: string,
  timeInMS: number
): Promise<string | undefined> => {
  const machineDefinition = definition(timeInMS);

  const arn = await stateMachineArn(session);

  if (!arn) {
    return "error";
  }

  await stepFunctions
    .updateStateMachine({
      stateMachineArn: arn,
      definition: machineDefinition,
    })
    .promise();

  await timer(5000);

  await startStateMachine(arn, session);

  return "success";
};

export const deleteStateMachine = async (arn: string) => {
  return stepFunctions.deleteStateMachine({ stateMachineArn: arn }).promise();
};
