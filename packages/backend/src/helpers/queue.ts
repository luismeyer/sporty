import { updateItem } from '../services/db';
import { callSpotify, createUri, spotify } from '../services/spotify';
import { sessionUsers } from './user';

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
