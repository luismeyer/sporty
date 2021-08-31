import { InjectionKey } from "vue";
import { createStore, Store, useStore as baseUseStore } from "vuex";

import { queueModule, QueueState } from "./queue";
import { sessionModule, SessionState } from "./session";
import { userModule, UserState } from "./user";

export type RootState = {
  queue: QueueState;
  session: SessionState;
  user: UserState;
};

export const storeKey: InjectionKey<Store<RootState>> = Symbol();

export const useState = (): RootState => {
  return baseUseStore(storeKey).state;
};

export const useStore = (): Store<RootState> => {
  return baseUseStore(storeKey);
};

export const store = createStore<RootState>({
  modules: {
    queue: queueModule,
    session: sessionModule,
    user: userModule,
  },
});
