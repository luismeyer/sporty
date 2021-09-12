import qrcode from 'qrcode';

import { FrontendSession, FrontendUser, Session } from '@sporty/api';

import { frontendUrl } from '../helpers/const';

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
