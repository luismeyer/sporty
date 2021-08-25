import AWS from "aws-sdk";

import { ddbTable } from "./const";

const { SPOTIFY_ID_INDEX, SESSION_INDEX } = process.env;

if (!SPOTIFY_ID_INDEX) {
  throw new Error("Missing Env Var: 'SPOTIFY_ID_INDEX'");
}

if (!SESSION_INDEX) {
  throw new Error("Missing Env Var: 'SESSION_INDEX'");
}

export const spotifyIdIndex = SPOTIFY_ID_INDEX;
export const sessionIndex = SESSION_INDEX;

const DB = new AWS.DynamoDB.DocumentClient({ region: "eu-central-1" });

export const getItem = async <T>(id: string): Promise<T | undefined> => {
  const result = await DB.get({ TableName: ddbTable, Key: { id } }).promise();

  if (!result.Item) {
    return;
  }

  return result.Item as T;
};

export const putItem = async <T>(item: T): Promise<T | undefined> => {
  const result = await DB.put({ TableName: ddbTable, Item: item }).promise();

  if (result.$response.error) {
    return;
  }

  return item;
};

type ScanInput = {
  expressionAttributeNames: AWS.DynamoDB.DocumentClient.ExpressionAttributeNameMap;
  expressionAttributeValues: AWS.DynamoDB.DocumentClient.ExpressionAttributeNameMap;
  scanFilter: string;
};

export const scanItems = async <T>(input: ScanInput): Promise<T[]> => {
  const result = await DB.scan({
    TableName: ddbTable,
    ExpressionAttributeNames: input.expressionAttributeNames,
    ExpressionAttributeValues: input.expressionAttributeValues,
    FilterExpression: input.scanFilter,
  }).promise();

  if (!result.Items) {
    return [];
  }

  return result.Items as T[];
};

type QueryInput = {
  expressionAttributeNames: AWS.DynamoDB.DocumentClient.ExpressionAttributeNameMap;
  expressionAttributeValues: AWS.DynamoDB.DocumentClient.ExpressionAttributeNameMap;
  keyConditionExpression: string;
};

export const queryItems = async <T>(
  index: string,
  input: QueryInput
): Promise<T[]> => {
  const result = await DB.query({
    TableName: ddbTable,
    IndexName: index,
    ExpressionAttributeNames: input.expressionAttributeNames,
    ExpressionAttributeValues: input.expressionAttributeValues,
    KeyConditionExpression: input.keyConditionExpression,
  }).promise();

  if (!result.Items) {
    return [];
  }

  return result.Items as T[];
};

type UpdateInput = {
  expressionAttributeNames?: AWS.DynamoDB.DocumentClient.ExpressionAttributeNameMap;
  expressionAttributeValues?: AWS.DynamoDB.DocumentClient.ExpressionAttributeNameMap;
  updateExpression: string;
};

export const updateItem = async (id: string, input: UpdateInput) => {
  await DB.update({
    TableName: ddbTable,
    Key: { id },
    UpdateExpression: input.updateExpression,
    ExpressionAttributeNames: input.expressionAttributeNames,
    ExpressionAttributeValues: input.expressionAttributeValues,
  }).promise();
};

export const updateTokens = async (
  id: string,
  accessToken: string,
  refreshToken?: string
) => {
  const expressionAttributeNames = {
    "#accessToken": "accessToken",
    ...(refreshToken && { "#refreshToken": "refreshToken" }),
  };

  const expressionAttributeValues = {
    ":accessToken": accessToken,
    ...(refreshToken && { ":refreshToken": refreshToken }),
  };

  const updateExpression = `SET #accessToken = :accessToken ${
    refreshToken ? ", #refreshToken = :refreshToken" : ""
  }`;

  await updateItem(id, {
    expressionAttributeNames,
    expressionAttributeValues,
    updateExpression,
  });
};
