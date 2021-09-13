import AWS from "aws-sdk";

import { Session, User } from "@sporty/api";

import {
  __DEV__,
  machineLambdaName,
  stateMachineRoleArn,
} from "../helpers/const";
import { getMachineArn, getMachineDefinition } from "../helpers/state-machine";
import { SessionRepository } from "../repositories/session.repo";
import { LambdaService } from "./lambda.service";
import { callSpotify, spotify } from "./spotify";

export const stepFunctions = new AWS.StepFunctions({ region: "eu-central-1" });

export const MACHINE_CREATION_TIMEOUT = 5000;

export class StateMachineService {
  private name: string;
  private session: Session;

  private sessionRepo: SessionRepository;
  private lambdaService: LambdaService;

  constructor(session: Session) {
    this.session = session;
    this.name = StateMachineService.createName(session.id);
    this.sessionRepo = new SessionRepository(session.id);
    this.lambdaService = new LambdaService(machineLambdaName);
  }

  static createName(id: string) {
    return id + "stepfc";
  }

  updateExecutionArn(executionArn: string) {
    return this.sessionRepo.setExecutionArn(executionArn);
  }

  async stopExecution() {
    if (!this.session.executionArn) {
      return;
    }

    await this.sessionRepo.removeExecutionArn();

    return stepFunctions
      .stopExecution({ executionArn: this.session.executionArn })
      .promise()
      .catch((e) => console.log("Error stopping execution: " + e));
  }

  async startExecution(arn: string) {
    const { executionArn } = await stepFunctions
      .startExecution({ stateMachineArn: arn, input: this.session.id })
      .promise();

    await this.updateExecutionArn(executionArn);
  }

  async createMachine(player: User): Promise<string> {
    const timeInMS = await this.getTimeout(player);

    // Generate definition json
    const machineDefinition = getMachineDefinition(timeInMS);

    if (__DEV__) {
      console.log("Creating Statemachine with definition: ", machineDefinition);
      return "success";
    }

    const result = await stepFunctions
      .createStateMachine({
        definition: machineDefinition,
        name: this.name,
        roleArn: stateMachineRoleArn,
      })
      .promise();

    await this.startExecution(result.stateMachineArn);

    return "success";
  }

  async updateMachine(player: User) {
    const timeInMS = await this.getTimeout(player);

    // Generate definition json
    const machineDefinition = getMachineDefinition(timeInMS);

    if (__DEV__) {
      console.log("Updating Statemachine with definition: ", machineDefinition);
      await this.lambdaService.invokeFunction({
        session: this.session,
        arn: "arn",
      });

      return "success";
    }

    const arn = await getMachineArn(this.name);

    if (!arn) {
      return "error no arn";
    }

    await stepFunctions
      .updateStateMachine({
        stateMachineArn: arn,
        definition: machineDefinition,
      })
      .promise();

    await this.lambdaService.invokeFunction({ session: this.session, arn });

    return "success";
  }

  // Static method for deletion if session was deleted
  static async deleteMachine(sessionId: string) {
    const arn = await getMachineArn(StateMachineService.createName(sessionId));

    if (!arn) {
      return;
    }

    return stepFunctions.deleteStateMachine({ stateMachineArn: arn }).promise();
  }

  async deleteMachine() {
    const arn = await getMachineArn(this.name);

    if (!arn) {
      return;
    }

    return stepFunctions.deleteStateMachine({ stateMachineArn: arn }).promise();
  }

  private async getTimeout(user: User): Promise<number | undefined> {
    const res = await callSpotify(user, () =>
      spotify.getMyCurrentPlayingTrack()
    );

    if (!res) {
      return;
    }

    const {
      body: { item, progress_ms },
    } = res;

    if (progress_ms === null || !item) {
      return;
    }

    return item.duration_ms - progress_ms;
  }
}
