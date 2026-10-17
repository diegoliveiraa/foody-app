import { act, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { installFakeViewport, type FakeViewport } from "@/test/media";
import { ResponsiveList } from "./index";

const CARDS: string = "cards";

const TABLE: string = "table";

function renderList(): void {
  render(<ResponsiveList cards={CARDS} table={TABLE} />);
}

describe("ResponsiveList", () => {
  it("shows the cards on a phone", () => {
    installFakeViewport(320);

    renderList();

    expect(screen.getByText(CARDS)).toBeVisible();
    expect(screen.queryByText(TABLE)).toBeNull();
  });

  it("still shows the cards at 768px, where the sidebar leaves no room for a table", () => {
    installFakeViewport(768);

    renderList();

    expect(screen.getByText(CARDS)).toBeVisible();
    expect(screen.queryByText(TABLE)).toBeNull();
  });

  it("shows only the table from 1024px up", () => {
    installFakeViewport(1024);

    renderList();

    expect(screen.getByText(TABLE)).toBeVisible();
    expect(screen.queryByText(CARDS)).toBeNull();
  });

  it("switches to the cards when the window shrinks below 1024px", () => {
    const viewport: FakeViewport = installFakeViewport(1280);
    renderList();

    act((): void => viewport.resize(1023));

    expect(screen.getByText(CARDS)).toBeVisible();
  });
});
