import { Queue, QueueItem, Track, User } from "@qify/api";

import { updateItem } from "../services/db";
import { callSpotify, createUri, spotify } from "../services/spotify";
import { hasActiveDevice, hasActiveDevices } from "./device";
import { generateTrack } from "./track";
import { sessionUsers, transformUser } from "./user";

export const updateQueue = async (session: string, users?: User[]) => {
  const usersInSession = users ?? (await sessionUsers(session));

  const players = usersInSession.filter((user) => user.isPlayer);

  if (!hasActiveDevices(players)) {
    return;
  }

  await Promise.all(
    usersInSession.map(async (user) => {
      // Pick first song in Queue
      const [id] = user.queue;
      if (!id) {
        return;
      }

      // Iterate all players in the Session
      for (let player of players) {
        if (!hasActiveDevice(player)) {
          return;
        }

        // Update queue of player
        await callSpotify(player, () => spotify.addToQueue(createUri(id)))
          .then(() => true)
          .catch(() => false);
      }

      // Remove item from player queue
      await updateItem(user.id, {
        expressionAttributeNames: { "#queue": "queue" },
        updateExpression: "REMOVE #queue[0]",
      });
    })
  );
};

const itemsInQueue = (users: User[]): boolean => {
  return users.some((user) => user.queue.length > 0);
};

export const generateQueue = async (currentUser: User): Promise<Queue> => {
  if (!currentUser.session) {
    const transformedUser = await transformUser(currentUser);

    return Promise.all(
      currentUser.queue.map(async (id) => ({
        track: await generateTrack(currentUser, id),
        user: transformedUser,
      }))
    );
  }

  // Replace the current user in the user response so the updated queue is used
  const usersResponse = await sessionUsers(currentUser.session).then((res) =>
    res.map((user) => (user.id === currentUser.id ? currentUser : user))
  );

  // Save frontend users in map so we don't make a spotify request for every transformed song
  const users = await Promise.all(
    usersResponse.map(async (user) => ({
      user,
      frontendUser: await transformUser(user),
    }))
  );

  const queueUpdates: QueueItem[][] = [];

  while (itemsInQueue(usersResponse)) {
    const tracks = await Promise.all(
      users.map(async ({ user, frontendUser }) => {
        const id = user.queue.shift();

        if (!id) {
          return;
        }

        return {
          user: frontendUser,
          track: await generateTrack(user, id),
        };
      })
    );

    queueUpdates.push(
      tracks.filter((item): item is QueueItem => Boolean(item))
    );
  }

  return queueUpdates.flat();
};
