import { FrontendQueue, Queue, QueueItem, Session, User } from "@qify/api";

import { updateItem } from "../services/db";
import { callSpotify, generateUri, spotify } from "../services/spotify";
import { filterNullish } from "./array";
import { hasActiveDevice, hasActiveDevices } from "./device";
import { generateTrack } from "./track";
import { sessionUsers, transformUser } from "./user";

export const updateQueue = async (session: Session, users?: User[]) => {
  const usersInSession = users ?? (await sessionUsers(session.id));

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
        await callSpotify(player, () => spotify.addToQueue(generateUri(id)))
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

export const hasItemsInQueue = (users: User[]): boolean => {
  return users.some((user) => user.queue.length > 0);
};

export const transformQueue = async (queue: Queue): Promise<FrontendQueue> => {
  return Promise.all(
    queue.map(async (item) => {
      const user = await transformUser(item.user);

      if (!user) {
        return;
      }

      return {
        track: item.track,
        user,
      };
    })
  ).then(filterNullish);
};

export const generateQueue = async (
  currentUser: User,
  limit?: number
): Promise<Queue> => {
  // Handle if current user isn't in a session
  if (!currentUser.session) {
    const queue = await Promise.all(
      currentUser.queue.map(async (id) => {
        const track = await generateTrack(currentUser, id);

        if (!track) {
          return;
        }

        return {
          track,
          user: currentUser,
        };
      })
    );

    return filterNullish(queue);
  }

  // Replace the current user in the user response so the updated queue is used
  const users = await sessionUsers(currentUser.session).then((res) =>
    res.map((user) => (user.id === currentUser.id ? currentUser : user))
  );

  const queueUpdates: QueueItem[][] = [];
  let count = 0;

  while (hasItemsInQueue(users) && count < (limit ?? 100)) {
    const tracks = await Promise.all(
      users.map(async (user) => {
        const id = user.queue.shift();

        if (!id) {
          return;
        }

        const track = await generateTrack(user, id);

        if (!track) {
          return;
        }

        return {
          user,
          track,
        };
      })
    );

    queueUpdates.push(filterNullish(tracks));

    count = count + 1;
  }

  return queueUpdates.flat();
};
