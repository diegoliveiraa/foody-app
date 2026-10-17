import { act, renderHook, waitFor, type RenderHookResult } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import type { MenuCategory, MenuResponse } from "@/@types/menu";
import { tokenReceived } from "@/store/slices/session";
import { problem } from "@/test/problems";
import { withStore } from "@/test/render";
import { apiUrl, server } from "@/test/server";
import { createTestStore, type TestStore } from "@/test/store";
import type { CategoryChip, MenuModel } from "../types";
import { useMenu } from "./use-menu";

type MenuHook = RenderHookResult<MenuModel, unknown>;

const MENU: MenuResponse = {
  categories: [
    {
      id: "c-lanches",
      name: "Lanches",
      products: [{ id: "p-smash", name: "Smash duplo", description: null, price: 34.9 }],
    },
    {
      id: "c-bebidas",
      name: "Bebidas",
      products: [{ id: "p-limonada", name: "Limonada", description: null, price: 12 }],
    },
  ],
};

function renderMenu(): MenuHook {
  const { store }: TestStore = createTestStore();
  store.dispatch(tokenReceived("valid-token"));
  return renderHook(useMenu, { wrapper: withStore(store) });
}

function sectionNames(model: MenuModel): string[] {
  return model.sections.map(({ name }: MenuCategory): string => name);
}

describe("useMenu", () => {
  it("offers a chip for every category after Todos, in the API's order", async () => {
    server.use(http.get(apiUrl("/menu"), () => HttpResponse.json(MENU)));

    const { result }: MenuHook = renderMenu();

    await waitFor((): void => expect(result.current.loading).toBe(false));
    expect(result.current.chips.map(({ label }: CategoryChip): string => label)).toEqual([
      "Todos",
      "Lanches",
      "Bebidas",
    ]);
    expect(result.current.productNames.get("p-limonada")).toBe("Limonada");
  });

  it("filters the loaded menu by category and by name, without asking the API again", async () => {
    const requests: string[] = [];
    server.use(
      http.get(apiUrl("/menu"), ({ request }) => {
        requests.push(request.url);
        return HttpResponse.json(MENU);
      }),
    );
    const { result }: MenuHook = renderMenu();
    await waitFor((): void => expect(result.current.loading).toBe(false));

    act((): void => result.current.actions.chooseCategory("c-bebidas"));
    const byCategory: string[] = sectionNames(result.current);
    act((): void => result.current.actions.chooseCategory("ALL"));
    act((): void => result.current.actions.changeSearch("smash"));

    expect(byCategory).toEqual(["Bebidas"]);
    expect(sectionNames(result.current)).toEqual(["Lanches"]);
    expect(requests).toHaveLength(1);
  });

  it("tells why the menu could not be loaded", async () => {
    server.use(
      http.get(apiUrl("/menu"), () =>
        HttpResponse.json(problem(500, "INTERNAL_ERROR", "Erro inesperado"), { status: 500 }),
      ),
    );

    const { result }: MenuHook = renderMenu();

    await waitFor((): void => expect(result.current.loadError).toBe("Erro inesperado"));
    expect(result.current.sections).toEqual([]);
  });
});
