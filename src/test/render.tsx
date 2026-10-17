import type { JSX, ReactNode } from "react";
import { Provider } from "react-redux";
import type { AppStore } from "@/store";

interface WrapperProps {
  children: ReactNode;
}

export function withStore(store: AppStore): (props: WrapperProps) => JSX.Element {
  return function StoreWrapper({ children }: WrapperProps): JSX.Element {
    return <Provider store={store}>{children}</Provider>;
  };
}
