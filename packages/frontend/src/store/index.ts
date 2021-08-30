import { InjectionKey } from "vue";
import { createStore, Store, useStore as baseUseStore } from "vuex";

import { authModule, AuthState } from "./auth";
import { queueModule, QueueState } from "./queue";
import { sessionModule, SessionState } from "./session";
import { userModule, UserState } from "./user";

export type RootState = {
  auth: AuthState;
  queue: QueueState;
  session: SessionState;
  user: UserState;
};

export const storeKey: InjectionKey<Store<RootState>> = Symbol();

export const useStore = (): Store<RootState> => {
  return baseUseStore(storeKey);
};

export const store = createStore<RootState>({
  modules: {
    auth: authModule,
    queue: queueModule,
    session: sessionModule,
    user: userModule,
  },
});
