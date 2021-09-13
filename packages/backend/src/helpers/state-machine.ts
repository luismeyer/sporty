import {
  MACHINE_CREATION_TIMEOUT,
  stepFunctions,
} from "../services/state-machine";
import { queueLambdaArn } from "./const";

const MACHINE_DEFAULT_WAITING_TIME = 60;

export const getMachineDefinition = (timeInMS?: number) => {
  const time = timeInMS
    ? Math.floor((timeInMS - MACHINE_CREATION_TIMEOUT - 1000) / 1000)
    : MACHINE_DEFAULT_WAITING_TIME;

  const Seconds = time > 0 ? time : MACHINE_DEFAULT_WAITING_TIME;

  return JSON.stringify({
    Comment: "State Machine for sporty",
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

export const getMachineArn = async (name: string) => {
  let listMachinesResult = await stepFunctions.listStateMachines().promise();
  let machines = listMachinesResult.stateMachines;

  while (listMachinesResult.nextToken) {
    machines = [...machines, ...listMachinesResult.stateMachines];

    listMachinesResult = await stepFunctions
      .listStateMachines({ nextToken: listMachinesResult.nextToken })
      .promise();
  }

  return machines.find((machine) => machine.name === name)?.stateMachineArn;
};
