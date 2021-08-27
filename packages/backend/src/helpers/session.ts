import qrcode from "qrcode";
import { FrontendUser, Session } from "@qify/api";

import { frontendUrl } from "./const";

const svgToDataURL = (svgStr: string) => {
  const encoded = encodeURIComponent(svgStr)
    .replace(/'/g, "%27")
    .replace(/"/g, "%22");

  const header = "data:image/svg+xml,";
  const dataUrl = header + encoded;

  return dataUrl;
};

export const transformSession = async (
  session: string,
  users: FrontendUser[]
): Promise<Session> => {
  const url = frontendUrl + `/join?session=${session}`;

  const svg = await qrcode.toString(url, { type: "svg", margin: 2 });
  const qrCode = svgToDataURL(svg);

  return {
    session,
    url,
    qrCode,
    users,
  };
};
