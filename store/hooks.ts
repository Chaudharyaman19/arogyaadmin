"use client";

import { useStoreContext, RootState } from "./StoreProvider";

export function useAppSelector<TSelected>(selector: (state: RootState) => TSelected): TSelected {
  const { state } = useStoreContext();
  return selector(state);
}

export function useAppDispatch() {
  const { dispatch } = useStoreContext();
  return dispatch;
}
