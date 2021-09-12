import { Handler } from "aws-lambda";
import dayjs from "dayjs";

import { Session } from "@sporty/api";

import { getItem } from "./services/db";
import { PlayerService } from "./services/player.service";
import { QueueService } from "./services/queue.service";
import { SessionService } from "./services/session.service";
import {
  deleteStateMachine,
  stopStateMachineExecution,
  updateStateMachine,
} from "./services/state-machine";
import { UserService } from "./services/user";

export const handler: Handler<{ session?: string }> = async (event) => {
  const sessionId = String(event.session);

  const session = await getItem<Session>(sessionId);

  if (!session) {
    await deleteStateMachine(sessionId);
    return "error no session";
  }

  const sessionService = new SessionService(session);

  // Stop the running execution if exists
  await stopStateMachineExecution(session);

  const sessionUsers = await sessionService.getUsers();

  // Delete Machine if all Users left or session ran in the timeout
  if (sessionUsers.length === 0 || dayjs().isAfter(session.timeout)) {
    await sessionService.delete();

    return "delete success";
  }

  const players = sessionUsers.filter((user) => user.isPlayer);

  // Increase timeout if there is atleast one active device
  if (await sessionService.hasActiveDevices()) {
    await sessionService.updateTimeout(dayjs().add(5, "minutes").toISOString());
  }

  const maybeActivePlayer = players.find((player) => {
    const userService = new UserService(player);
    return userService.hasActiveDevice();
  });

  const activePlayer = maybeActivePlayer ?? players[0];

  const queueService = new QueueService(session, players, activePlayer);
  const queueItem = await queueService.popItem();

  // Sync player if next track exists
  if (queueItem) {
    const playerService = new PlayerService(players, activePlayer);
    await playerService.start(queueItem.track);
  }

  return await updateStateMachine(session, activePlayer);
};
