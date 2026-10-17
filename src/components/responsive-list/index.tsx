import type { JSX, ReactNode } from "react";
import { LIST_CARDS_MEDIA_QUERY } from "@/constants/breakpoints";
import { useMediaQuery } from "@/hooks/use-media-query";

interface ResponsiveListProps {
  cards: ReactNode;
  table: ReactNode;
}

export function ResponsiveList({ cards, table }: ResponsiveListProps): JSX.Element {
  const showsCards: boolean = useMediaQuery(LIST_CARDS_MEDIA_QUERY);

  return <>{showsCards ? cards : table}</>;
}
