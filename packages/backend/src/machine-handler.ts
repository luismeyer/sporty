import { Handler } from "aws-lambda";

import { Session } from "@sporty/api";

import { __DEV__ } from "./helpers/const";
import { timer } from "./helpers/timer";
import {
  MACHINE_CREATION_TIMEOUT,
  StateMachineService,
} from "./services/machine.service";

type Event = {
  arn?: string;
  session?: Session;
};

// this lambda starts the state-machine with a delay
// the function will get async invoced so the frontend
// receives a faster response
export const handler: Handler<Event> = async (event) => {
  console.log("machine received ", event);

  if (!event) {
    return "Missing event";
  }

  const { arn, session } = event;

  if (!arn || !session) {
    return "Missing input";
  }

  await timer(MACHINE_CREATION_TIMEOUT);

  if (__DEV__) {
    console.log("starting execution", session, arn);
    return "dev: not starting machine";
  }

  const machineService = new StateMachineService(session);
  await machineService.startExecution(arn);

  return "started machine";
};
