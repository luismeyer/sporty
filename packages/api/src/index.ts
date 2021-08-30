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

export type ErrorResponse = {
  success: false;
  error: string;
};

export type SuccessResponse<T> = {
  success: true;
  body: T;
};

export type Response<T> = ErrorResponse | SuccessResponse<T>;

export type LoginResponse = Response<{ url: string }>;

export type AuthorizeResponse = Response<{ token: string }>;

export type QueueItem = {
  track: Track;
  user: FrontendUser;
};

export type Queue = QueueItem[];

export type QueueResponse = Response<{ queue: Queue }>;

export type SearchResponse = Response<{ tracks: Track[] }>;

export type FrontendSession = {
  session: string;
  timeout: string;
  url: string;
  qrCode: string;
  users: FrontendUser[];
};

export type SessionResponse = Response<FrontendSession>;

export type MessageResponse = Response<{ message: string }>;

export type UserResponse = Response<FrontendUser>;
