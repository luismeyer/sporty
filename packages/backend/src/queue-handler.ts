import { Handler } from "aws-lambda";
import dayjs from "dayjs";

import { Session } from "@qify/api";

import { hasActiveDevices } from "./helpers/device";
import { updateQueue } from "./helpers/queue";
import { deleteSession, updateSessionTimeout } from "./helpers/session";
import { sessionUsers } from "./helpers/user";
import { getItem } from "./services/db";
import { callSpotify, spotify } from "./services/spotify";
import {
  deleteStateMachine,
  stateMachineArn,
  updateStateMachine,
} from "./services/state-machine";

export const handler: Handler<{ session?: string }> = async (event) => {
  const sessionId = String(event.session);

  const session = await getItem<Session>(sessionId);

  if (!session) {
    return "error no session";
  }

  const users = await sessionUsers(session.id);

  // Delete Machine if all Users left or session ran in the timeout
  if (users.length === 0 || dayjs().isAfter(session.timeout)) {
    await deleteSession(session, users);

    const arn = await stateMachineArn(session.id);

    if (!arn) {
      return "error no arn";
    }

    await deleteStateMachine(arn);

    return "delete success";
  }

  // Time in MS when the next Queue Lambda will be executed
  let time: number | undefined;

  const players = users.filter((user) => user.isPlayer);
  const sessionIsActive = await hasActiveDevices(players);

  // Increase timeout if there is atleast one active device
  if (sessionIsActive) {
    await updateSessionTimeout(
      session,
      dayjs().add(5, "minutes").toISOString()
    );
  }

  // Calculate the Machine Waiting Time by the Currentsong
  if (players.length) {
    const [player] = players;

    const res = await callSpotify(player, () =>
      spotify.getMyCurrentPlayingTrack()
    );

    if (!res) {
      return;
    }

    const { body } = res;

    time =
      body.item && body.progress_ms
        ? body.item.duration_ms - body.progress_ms
        : undefined;
  }

  await updateQueue(session, users);

  return await updateStateMachine(session, time);
};
