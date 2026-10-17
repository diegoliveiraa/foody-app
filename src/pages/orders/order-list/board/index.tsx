import type { JSX } from "react";
import type { MeScreen } from "@/@types/me";
import { PageHeader } from "@/components/page-header";
import { LIST_CARDS_MEDIA_QUERY } from "@/constants/breakpoints";
import { SCREEN_ACTIONS, SCREEN_KEYS } from "@/constants/screens";
import { useCan } from "@/hooks/use-can";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useMeScreen } from "@/hooks/use-me-screen";
import { useNow } from "@/hooks/use-now";
import { OrderListTabs } from "../components/order-list-tabs";
import { useOrderListPaths } from "../hooks/use-order-list-paths";
import type { OrderListPaths } from "../types";
import { BoardColumns } from "./components/board-columns";
import { BoardLoadError, BoardSkeleton } from "./components/board-states";
import { BoardTabs } from "./components/board-tabs";
import { PendingRequestsBanner } from "./components/pending-requests-banner";
import { ReloadButton, UpdatedAgo } from "./components/board-toolbar";
import { useOrderBoard } from "./hooks/use-order-board";
import type { OrderBoardModel } from "./types";

function BoardOrders({ board }: { board: OrderBoardModel }): JSX.Element {
  const showsTabs: boolean = useMediaQuery(LIST_CARDS_MEDIA_QUERY);
  const paths: OrderListPaths = useOrderListPaths();
  const now: number = useNow();

  if (showsTabs) {
    return <BoardTabs columns={board.columns} paths={paths} now={now} />;
  }
  return <BoardColumns columns={board.columns} paths={paths} now={now} />;
}

function BoardBody({ board }: { board: OrderBoardModel }): JSX.Element {
  const paths: OrderListPaths = useOrderListPaths();
  const canDecide: boolean = useCan(
    SCREEN_KEYS.ORDERS_ORDER_LIST,
    SCREEN_ACTIONS.DECIDE_CANCELLATION,
  );

  if (board.loading) {
    return <BoardSkeleton />;
  }
  if (board.loadError !== null) {
    return <BoardLoadError detail={board.loadError} />;
  }
  return (
    <>
      {canDecide && board.pendingRequests !== null && (
        <PendingRequestsBanner
          requests={board.pendingRequests}
          detailPath={paths.detail(board.pendingRequests.oldest.id)}
        />
      )}
      <BoardOrders board={board} />
    </>
  );
}

export function OrderBoardScreen(): JSX.Element {
  const screen: MeScreen | undefined = useMeScreen(SCREEN_KEYS.ORDERS_ORDER_LIST);
  const board: OrderBoardModel = useOrderBoard();

  return (
    <>
      <PageHeader title={screen?.label}>
        <ReloadButton refreshing={board.refreshing} onReload={board.reload} />
      </PageHeader>
      <section className="flex flex-1 flex-col gap-4 px-4 pb-8 md:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <OrderListTabs />
          <UpdatedAgo updatedAt={board.updatedAt} />
        </div>
        <BoardBody board={board} />
      </section>
    </>
  );
}
