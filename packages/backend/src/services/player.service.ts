import { Player, SessionUser, Track, User } from "@sporty/api";

import {
  generatePlayer,
  getDataForSync,
  getSyncOptions,
} from "../helpers/player";
import { callSpotify, spotify } from "./spotify";

export class PlayerService {
  private users: SessionUser[];
  private user: User;

  constructor(users: SessionUser[], user: User) {
    this.users = users;
    this.user = user;
  }

  async start(track: Track, songPosition?: number): Promise<Player> {
    const players = this.users.filter((user) => user.isPlayer);

    const syncOptions = await getSyncOptions(players, track, songPosition ?? 0);

    // Start playback
    await Promise.all(
      syncOptions.map((options) => {
        if (!options) {
          return;
        }

        return callSpotify(options.player, () => spotify.play(options));
      })
    );

    return generatePlayer(this.user);
  }

  async pause(): Promise<Player> {
    const players = this.users.filter((user) => user.isPlayer);

    await Promise.all(
      players.map(async (player) => {
        const playerPlayback = await callSpotify(player, () =>
          spotify.getMyCurrentPlaybackState()
        );

        if (!playerPlayback?.body.is_playing) {
          return;
        }

        await callSpotify(player, () => spotify.pause());

        return playerPlayback.body.item;
      })
    );

    return generatePlayer(this.user);
  }

  async sync(): Promise<Player> {
    const data = await getDataForSync(this.user);

    if (!data) {
      return generatePlayer();
    }

    const { position, track } = data;

    // Error if no song is given
    if (!track) {
      return generatePlayer();
    }

    await this.start(track, position);

    return generatePlayer(this.user);
  }

  async get(): Promise<Player> {
    return generatePlayer(this.user);
  }
}
