import AWS from "aws-sdk";

import { queueLambdaArn, stateMachineRoleArn, __DEV__ } from "../helpers/const";
import { timer } from "../helpers/timer";

const stepFunctions = new AWS.StepFunctions({ region: "eu-central-1" });

const MACHINE_CREATION_TIMEOUT = 5000;
const MACHINE_DEFAULT_WAITING_TIME = 60;

const definition = (timeInMS?: number) => {
  const time = timeInMS
    ? Math.floor((timeInMS - MACHINE_CREATION_TIMEOUT) / 1000)
    : MACHINE_DEFAULT_WAITING_TIME;

  const Seconds = time > 0 ? time : MACHINE_DEFAULT_WAITING_TIME;

  return JSON.stringify({
    Comment: "State Machine for qify",
    StartAt: "Wait",
    States: {
      Wait: {
        Comment:
          "A Wait state delays the state machine from continuing for a specified time.",
        Type: "Wait",
        Seconds,
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
};

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
  timeInMS?: number
): Promise<string> => {
  const machineDefinition = definition(timeInMS);

  if (__DEV__) {
    console.log("Creating Statemachine with definition: ", machineDefinition);
    return "success";
  }

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
  timeInMS?: number
): Promise<string | undefined> => {
  const machineDefinition = definition(timeInMS);

  if (__DEV__) {
    console.log("Updating Statemachine with definition: ", machineDefinition);
    return "success";
  }

  const arn = await stateMachineArn(session);

  if (!arn) {
    return "error no arn";
  }

  await stepFunctions
    .updateStateMachine({
      stateMachineArn: arn,
      definition: machineDefinition,
    })
    .promise();

  await timer(MACHINE_CREATION_TIMEOUT);

  await startStateMachine(arn, session);

  return "success";
};

export const deleteStateMachine = async (arn: string) => {
  return stepFunctions.deleteStateMachine({ stateMachineArn: arn }).promise();
};
