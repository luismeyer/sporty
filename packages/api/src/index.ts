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

export type Track = {
  id: string;
  name: string;
  artists: string[];
  image: {
    url: string;
    height?: number | undefined;
    width?: number | undefined;
  };
};
