const {
  SPOTIFY_CLIENT_ID,
  SPOTIFY_CLIENT_SECRET,
  DDB_TABLE,
  STATE_MACHINE_ROLE_ARN,
  QUEUE_LAMBDA_ARN,
  QIFY_SECRET,
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

if (!QIFY_SECRET) {
  throw new Error("Missing Env Var: 'QIFY_SECRET'");
}

export const ddbTable = DDB_TABLE;

export const spotifyClientId = SPOTIFY_CLIENT_ID;
export const spotifyClientSecret = SPOTIFY_CLIENT_SECRET;

export const stateMachineRoleArn = STATE_MACHINE_ROLE_ARN;
export const queueLambdaArn = QUEUE_LAMBDA_ARN;

export const qifySecret = QIFY_SECRET;

export const spotifyBasicHeader = `Basic ${Buffer.from(
  `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`
).toString("base64")}`;
