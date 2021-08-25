export type User = {
  id: string;
  spotifyId: string;
  accessToken: string;
  refreshToken: string;
  queue: string[];
  session?: string;
  isOwner?: boolean;
  isPlayer?: boolean;
};
