import { Queue, QueueItem, Track, User } from "@qify/api";

import { updateItem } from "../services/db";
import { callSpotify, createUri, spotify } from "../services/spotify";
import { generateTrack } from "./track";
import { sessionUsers, transformUser } from "./user";

export const updateQueue = async (session: string) => {
  const users = await sessionUsers(session);

  const players = users.filter((user) => user.isPlayer);

  await Promise.all(
    users.map(async (user) => {
      const id = user.queue.shift();
      if (!id) {
        return;
      }

      const res = await Promise.all(
        players.map((player) =>
          callSpotify(player, () => spotify.addToQueue(createUri(id)))
            .then(() => true)
            .catch(() => false)
        )
      );

      if (res.includes(false)) {
        return;
      }

      await updateItem(user.id, {
        expressionAttributeNames: { "#queue": "queue" },
        expressionAttributeValues: { ":queue": user.queue },
        updateExpression: "SET #queue = :queue",
      });
    })
  );
};

const itemsInQueue = (users: User[]): boolean => {
  return users.some((user) => user.queue.length > 0);
};

export const generateQueue = async (user: User): Promise<Queue> => {
  if (!user.session) {
    const transformedUser = await transformUser(user);

    return Promise.all(
      user.queue.map(async (id) => ({
        track: await generateTrack(user, id),
        user: transformedUser,
      }))
    );
  }

  const usersResponse = await sessionUsers(user.session);

  // Save frontend users in map so we don't request user infor for every transformed song
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
