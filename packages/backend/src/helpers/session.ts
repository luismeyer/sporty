import dayjs from "dayjs";
import qrcode from "qrcode";

import { FrontendSession, FrontendUser, Session, User } from "@qify/api";

import { deleteItem, getItem, putItem, updateItem } from "../services/db";
import { frontendUrl } from "./const";
import { randomNumber } from "./random";
import { removeUserFromSession } from "./user";

const createSessionId = () => String(randomNumber(1000, 9999));

export const generateSession = async (
  user: User
): Promise<Session | undefined> => {
  let sessionId = createSessionId();
  let sessionExists = Boolean(await getItem<Session>(sessionId));

  while (sessionExists) {
    sessionExists = Boolean(await getItem<Session>(sessionId));
    sessionId = createSessionId();
  }

  // Update session and activate owner and player mode
  await putItem<User>({
    ...user,
    session: sessionId,
    isOwner: true,
    isPlayer: true,
  });

  return putItem<Session>({
    id: sessionId,
    timeout: dayjs().add(5, "minutes").toISOString(),
  });
};

const svgToDataURL = (svgStr: string) => {
  const encoded = encodeURIComponent(svgStr)
    .replace(/'/g, "%27")
    .replace(/"/g, "%22");

  const header = "data:image/svg+xml,";
  const dataUrl = header + encoded;

  return dataUrl;
};

export const transformSession = async (
  session: Session,
  users: FrontendUser[]
): Promise<FrontendSession> => {
  const url = frontendUrl + `/join?session=${session.id}`;

  const svg = await qrcode.toString(url, {
    type: "svg",
    margin: 1.5,
  });
  const qrCode = svgToDataURL(svg);

  return {
    session: session.id,
    timeout: session.timeout,
    url,
    qrCode,
    users,
  };
};

export const updateSessionTimeout = async (
  session: Session,
  timeout: string
) => {
  await updateItem(session.id, {
    expressionAttributeNames: {
      "#timeout": "timeout",
    },
    expressionAttributeValues: {
      ":timeout": timeout,
    },
    updateExpression: "SET #timeout = :timeout ",
  });
};

export const deleteSession = async (session: Session, users: User[]) => {
  await deleteItem(session.id);

  await Promise.all(users.map(removeUserFromSession));
};

export const findSessionOwner = (us: User[]) => us.find((u) => u.isOwner);
