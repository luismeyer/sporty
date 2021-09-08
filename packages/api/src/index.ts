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

export type FrontendUser = Pick<User, "isOwner" | "isPlayer"> & {
  name: string;
  tracksInQueue: number;
  image?: string;
};

export type Session = {
  id: string;
  timeout: string;
  executionArn?: string;
};

export type FrontendSession = {
  session: string;
  timeout: string;
  url: string;
  qrCode: string;
  users: FrontendUser[];
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

export type ActivePlayer = {
  isActive: true;
  currentTrack: Track;
};

export type InActivePlayer = {
  isActive: false;
};

export type Player = ActivePlayer | InActivePlayer;

export type ErrorResponse = {
  success: false;
  error:
    | "INVALID_TOKEN"
    | "NO_ACTIVE_DEVICE"
    | "ALREADY_UPDATED"
    | "MISSING_PARAMETER"
    | "WRONG_PARAMETER"
    | "INTERNAL_ERROR"
    | "NOT_IMPLEMENTED"
    | "NO_SESSION";
};

export type QueueItem = {
  track: Track;
  user: User;
};

export type Queue = QueueItem[];

export type FrontendQueueItem = {
  track: Track;
  user: FrontendUser;
};

export type FrontendQueue = FrontendQueueItem[];

export type SuccessResponse<T> = {
  success: true;
  body: T;
};

export type Response<T> = ErrorResponse | SuccessResponse<T>;

export type LoginResponse = Response<{ url: string }>;

export type AuthorizeResponse = Response<{ token: string }>;

export type QueueResponse = Response<{ queue: FrontendQueue }>;

export type SearchResponse = Response<{ tracks: Track[] }>;

export type SessionResponse = Response<FrontendSession>;

export type MessageResponse = Response<{ message: string }>;

export type UserResponse = Response<FrontendUser>;

export type PlayerResponse = Response<Player>;
