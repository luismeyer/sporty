import { Queue, QueueItem, QueueResponse, Session, User } from "@sporty/api";

import { filterNullish } from "../helpers/array";
import { randomNumber } from "../helpers/random";
import { generateTrack } from "../helpers/track";
import { transformQueue } from "../transformers/queue";
import { transformTrack } from "../transformers/track";
import { updateItem } from "./db";
import { SessionService } from "./session.service";
import { callSpotify, spotify } from "./spotify";

export class QueueService {
  private session: Session;
  private sessionUsers: User[];
  private currentUser: User;

  constructor(session: Session, users: User[], user: User) {
    this.session = session;
    this.sessionUsers = users;
    this.currentUser = user;
  }

  hasItems(): boolean {
    return this.sessionUsers.some((user) => user.queue.length > 0);
  }

  async generateQueueResponse() {
    return {
      queue: await this.generate().then(transformQueue),
    };
  }

  async generate(limit = 100): Promise<Queue> {
    // Replace the current user in the user response so the updated queue is used
    const users = this.sessionUsers.map((user) =>
      user.id === this.currentUser.id ? this.currentUser : user
    );

    const queueUpdates: QueueItem[][] = [];
    let count = 0;

    while (this.hasItems() && count < limit) {
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
  }

  async popItem(): Promise<QueueItem | undefined> {
    const [item] = await this.generate(1);

    // create next song automatic
    if (!item) {
      // find user responsible for next song
      const sessionService = new SessionService(this.session);

      const maybeOwner = await sessionService.findSessionOwner();

      const owner = maybeOwner ?? this.currentUser;

      // find random track in top tracks
      const res = await callSpotify(owner ?? this.currentUser, () =>
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
  }

  async appendItem(trackId: string): Promise<void> {
    await updateItem(this.currentUser.id, {
      expressionAttributeNames: { "#queue": "queue" },
      expressionAttributeValues: {
        ":new_item": [trackId],
        ":empty_list": [],
      },
      updateExpression:
        "SET #queue = list_append(if_not_exists(#queue, :empty_list), :new_item)",
    });
  }
}
