import { useSelector } from "react-redux";
import type { MeResponse } from "@/@types/me";
import { useGetMeQuery } from "@/services/me";
import type { RootState } from "@/store";
import { selectAccessToken } from "@/store/slices/session";

function selectSignedIn(state: RootState): boolean {
  return selectAccessToken(state) !== null;
}

export function useMe(): MeResponse | undefined {
  const signedIn: boolean = useSelector(selectSignedIn);
  const { data } = useGetMeQuery(undefined, { skip: !signedIn });
  return data;
}
