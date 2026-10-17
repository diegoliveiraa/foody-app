import { MOBILE_MEDIA_QUERY } from "@/constants/breakpoints";
import { useMediaQuery } from "./use-media-query";

export function useIsMobile(): boolean {
  return useMediaQuery(MOBILE_MEDIA_QUERY);
}
