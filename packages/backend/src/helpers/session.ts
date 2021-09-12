import dayjs from 'dayjs';

import { Session, User } from '@sporty/api';

import { getItem, putItem } from '../services/db';
import { randomNumber } from './random';

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
