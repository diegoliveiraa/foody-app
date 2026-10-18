import { useSearchParams } from "react-router";
import { REDIRECT_TO_PARAM } from "@/constants/routes";
import type { AuthRedirect } from "@/routes/types";
import { authPathKeeping, redirectDestination } from "@/utils/auth-redirect";

export function useAuthRedirect(otherAuthPath: string): AuthRedirect {
  const [searchParams] = useSearchParams();
  const redirectTo: string | null = searchParams.get(REDIRECT_TO_PARAM);

  return {
    destination: redirectDestination(redirectTo),
    switchPath: authPathKeeping(otherAuthPath, redirectTo),
  };
}
