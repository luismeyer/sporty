const {
  SPOTIFY_CLIENT_ID,
  SPOTIFY_CLIENT_SECRET,
  DDB_TABLE,
  STATE_MACHINE_ROLE_ARN,
  QUEUE_LAMBDA_ARN,
  SPORTY_SECRET,
  FRONTEND_URL,
  IS_OFFLINE,
  IS_LOCAL,
  MACHINE_LAMBDA_NAME,
} = process.env;

if (!SPOTIFY_CLIENT_ID) {
  throw new Error("Missing Env Var: 'SPOTIFY_CLIENT_ID'");
}

if (!SPOTIFY_CLIENT_SECRET) {
  throw new Error("Missing Env Var: 'SPOTIFY_CLIENT_SECRET'");
}

if (!DDB_TABLE) {
  throw new Error("Missing Env Var: 'DDB_TABLE'");
}

if (!STATE_MACHINE_ROLE_ARN) {
  throw new Error("Missing Env Var: 'STATE_MACHINE_ROLE_ARN'");
}

if (!QUEUE_LAMBDA_ARN) {
  throw new Error("Missing Env Var: 'QUEUE_LAMBDA_ARN'");
}

if (!SPORTY_SECRET) {
  throw new Error("Missing Env Var: 'SPORTY_SECRET'");
}

if (!FRONTEND_URL) {
  throw new Error("Missing Env Var: 'FRONTEND_URL'");
}

if (!MACHINE_LAMBDA_NAME) {
  throw new Error("Missing Env Var: 'MACHINE_LAMBDA_NAME'");
}

export const ddbTable = DDB_TABLE;

export const spotifyClientId = SPOTIFY_CLIENT_ID;
export const spotifyClientSecret = SPOTIFY_CLIENT_SECRET;

export const stateMachineRoleArn = STATE_MACHINE_ROLE_ARN;
export const queueLambdaArn = QUEUE_LAMBDA_ARN;
export const machineLambdaName = MACHINE_LAMBDA_NAME;

export const sportySecret = SPORTY_SECRET;

export const spotifyBasicHeader = `Basic ${Buffer.from(
  `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`
).toString("base64")}`;

export const frontendUrl = IS_OFFLINE ? "http://localhost:8080" : FRONTEND_URL;

export const __DEV__ = IS_OFFLINE || IS_LOCAL;
