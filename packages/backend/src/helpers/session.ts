import qrcode from "qrcode";
import { FrontendUser, Session } from "@qify/api";

import { frontendUrl } from "./const";

export const transformSession = async (
  session: string,
  users: FrontendUser[]
): Promise<Session> => {
  const url = frontendUrl + `/join?session=${session}`;

  const qrCode = await qrcode.toDataURL(url);

  return {
    session,
    url,
    qrCode,
    users,
  };
};
