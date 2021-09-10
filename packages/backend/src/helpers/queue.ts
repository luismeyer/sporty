import { FrontendQueue, Queue, QueueItem, User } from "@sporty/api";

import { updateItem } from "../services/db";
import { callSpotify, spotify } from "../services/spotify";
import { filterNullish } from "./array";
import { randomNumber } from "./random";
import { findSessionOwner } from "./session";
import { generateTrack, transformTrack } from "./track";
import { sessionUsers, transformUser } from "./user";

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

const generateQueuePrivate = async (currentUser: User) => {
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
};

const generateQueueSession = async (currentUser: User, limit: number) => {
  if (!currentUser.session) {
    return [];
  }

  // Replace the current user in the user response so the updated queue is used
  const users = await sessionUsers(currentUser.session).then((res) =>
    res.map((user) => (user.id === currentUser.id ? currentUser : user))
  );

  const queueUpdates: QueueItem[][] = [];
  let count = 0;

  while (hasItemsInQueue(users) && count < limit) {
    const tracks = await Promise.all(
      users.map(async (user) => {
        const id = user.queue.shift();

        if (!id) return;

        const track = await generateTrack(user, id);

        if (!track) return;

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

export const generateQueue = async (
  currentUser: User,
  limit = 100
): Promise<Queue> => {
  // Handle if current user isn't in a session
  if (!currentUser.session) {
    return generateQueuePrivate(currentUser);
  }

  return generateQueueSession(currentUser, limit);
};

export const popQueueItem = async (
  user: User
): Promise<QueueItem | undefined> => {
  const [item] = await generateQueue(user, 1);

  // create next song automatic
  if (!item) {
    // find user responsible for next song
    const maybeOwner = user.session
      ? await sessionUsers(user.session).then(findSessionOwner)
      : user;

    const owner = maybeOwner ?? user;

    // find random track in top tracks
    const res = await callSpotify(owner ?? user, () =>
      spotify.getMyTopTracks({ limit: 10, offset: randomNumber(0, 49) })
    );

    const song = res?.body.items[0];
    if (!song) return;

    const track = await transformTrack(owner, song);
    if (!track) return;

    return {
      track,
      user: owner,
    };
  }

  // Remove item from player queue
  await updateItem(item.user.id, {
    expressionAttributeNames: { "#queue": "queue" },
    updateExpression: "REMOVE #queue[0]",
  });

  return item;
};
