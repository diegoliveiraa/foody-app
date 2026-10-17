import { Construction } from "lucide-react";
import type { JSX } from "react";
import type { MeScreen } from "@/@types/me";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { MESSAGES } from "@/constants/messages";
import type { ScreenKey } from "@/constants/screens";
import { useMeScreen } from "@/hooks/use-me-screen";

interface ScreenPlaceholderProps {
  screenKey: ScreenKey;
}

export function ScreenPlaceholder({ screenKey }: ScreenPlaceholderProps): JSX.Element {
  const screen: MeScreen | undefined = useMeScreen(screenKey);

  return (
    <>
      <PageHeader title={screen?.label} />
      <section className="flex flex-1 px-4 pb-8 md:px-8">
        <EmptyState icon={Construction} title={MESSAGES.SCREEN_PLACEHOLDER.TITLE} />
      </section>
    </>
  );
}
