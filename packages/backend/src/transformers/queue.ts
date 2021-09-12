import { FrontendQueue, Queue } from '@sporty/api';

import { filterNullish } from '../helpers/array';
import { transformUser } from './user';

export const transformQueue = async (queue: Queue): Promise<FrontendQueue> => {
  return Promise.all(
    queue.map(async (item) => {
      const user = await transformUser(item.user);

      if (!user) {
        return;
      }

      return {
        track: item.track,
        user,
      };
    })
  ).then(filterNullish);
};
