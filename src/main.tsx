import "@/services/validation-schemas/zod-config";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import type { DataRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import { AppToaster } from "@/components/app-toaster";
import { createAppRouter } from "@/routes";
import { createAppStore, type AppStore } from "@/store";
import "./index.css";

const store: AppStore = createAppStore({
  navigate: (to: string): Promise<void> => router.navigate(to, { replace: true, flushSync: true }),
});

const router: DataRouter = createAppRouter(store);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
      <AppToaster />
    </Provider>
  </StrictMode>,
);
