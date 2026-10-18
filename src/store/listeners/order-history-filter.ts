import type { ListenerEffectAPI, UnknownAction } from "@reduxjs/toolkit";
import { SEARCH_DEBOUNCE_MS } from "@/constants/filters";
import type { HistoryFilterState } from "@/pages/orders/order-list/history/filter/types";
import type { AppDispatch, AppStartListening, RootState, StoreDependencies } from "@/store";
import {
  searchApplied,
  searchChanged,
  selectOrderHistoryFilter,
} from "@/store/slices/order-history-filter";
import { settledSearchToApply } from "@/utils/settled-search";

type HistoryListenerApi = ListenerEffectAPI<RootState, AppDispatch, StoreDependencies>;

async function applySettledSearch(
  _action: UnknownAction,
  listenerApi: HistoryListenerApi,
): Promise<void> {
  listenerApi.cancelActiveListeners();
  await listenerApi.delay(SEARCH_DEBOUNCE_MS);
  const filter: HistoryFilterState = selectOrderHistoryFilter(listenerApi.getState());
  const search: string | null = settledSearchToApply(filter, filter.search);
  if (search === null) {
    return;
  }
  listenerApi.dispatch(searchApplied(search));
}

export function listenForHistorySearch(startListening: AppStartListening): void {
  startListening({ actionCreator: searchChanged, effect: applySettledSearch });
}
