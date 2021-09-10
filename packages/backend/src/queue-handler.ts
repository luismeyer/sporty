import { Handler } from "aws-lambda";
import dayjs from "dayjs";

import { Session, User } from "@sporty/api";

import { hasActiveDevice, hasActiveDevices } from "./helpers/device";
import { popQueueItem } from "./helpers/queue";
import { deleteSession, updateSessionTimeout } from "./helpers/session";
import { sessionUsers } from "./helpers/user";
import { getItem } from "./services/db";
import { callSpotify, spotify } from "./services/spotify";
import {
  deleteStateMachine,
  stateMachineArn,
  stopSessionExecution,
  updateStateMachine,
} from "./services/state-machine";
import { syncPlayer } from "./helpers/player";

export const handler: Handler<{ session?: string }> = async (event) => {
  const sessionId = String(event.session);

  const session = await getItem<Session>(sessionId);

  if (!session) {
    await deleteStateMachine(sessionId);
    return "error no session";
  }

  // Stop the running execution if exists
  await stopSessionExecution(session);

  const users = await sessionUsers(session.id);

  // Delete Machine if all Users left or session ran in the timeout
  if (users.length === 0 || dayjs().isAfter(session.timeout)) {
    await deleteSession(session, users);
    await deleteStateMachine(session.id);

    return "delete success";
  }

  // Time in MS when the next Queue Lambda will be executed
  let time: number | undefined;

  const players = users.filter((user) => user.isPlayer);

  // Increase timeout if there is atleast one active device
  if (await hasActiveDevices(players)) {
    await updateSessionTimeout(
      session,
      dayjs().add(5, "minutes").toISOString()
    );
  }

  const activePlayer =
    players.find((player) => hasActiveDevice(player)) ?? players[0];

  const queueItem = await popQueueItem(activePlayer);

  // Sync player if next track exists
  if (queueItem) {
    await syncPlayer(activePlayer, players, queueItem.track);
  }

  const res = await callSpotify(activePlayer, () =>
    spotify.getMyCurrentPlayingTrack()
  );

  if (res) {
    const {
      body: { item, progress_ms },
    } = res;

    time = item && progress_ms ? item.duration_ms - progress_ms : undefined;
  }

  return await updateStateMachine(session, time);
};
