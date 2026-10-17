import { render, screen } from "@testing-library/react";
import userEvent, { type UserEvent } from "@testing-library/user-event";
import { describe, expect, it, vi, type Mock } from "vitest";
import type { PageMeta } from "@/@types/pagination";
import { MESSAGES } from "@/constants/messages";
import type { PageSize } from "@/constants/pagination";
import { ListPagination } from "./index";

interface Handlers {
  onPageChange: Mock<(page: number) => void>;
  onPageSizeChange: Mock<(pageSize: PageSize) => void>;
}

const MIDDLE_PAGE: PageMeta = {
  page: 2,
  pageSize: 10,
  totalItems: 42,
  totalPages: 5,
  hasNext: true,
  hasPrevious: true,
};

const FIRST_PAGE: PageMeta = { ...MIDDLE_PAGE, page: 1, hasPrevious: false };

const LAST_PAGE: PageMeta = { ...MIDDLE_PAGE, page: 5, hasNext: false };

function renderPagination(meta: PageMeta): Handlers {
  const handlers: Handlers = { onPageChange: vi.fn(), onPageSizeChange: vi.fn() };
  render(<ListPagination meta={meta} {...handlers} />);
  return handlers;
}

describe("ListPagination", () => {
  it("tells which page is shown and which items it holds", () => {
    renderPagination(MIDDLE_PAGE);

    expect(screen.getByText(MESSAGES.LIST.PAGE_OF(2, 5))).toBeVisible();
    expect(screen.getByText(MESSAGES.LIST.RANGE(11, 20, 42))).toBeVisible();
  });

  it("counts only the items a partial last page holds", () => {
    renderPagination(LAST_PAGE);

    expect(screen.getByText(MESSAGES.LIST.RANGE(41, 42, 42))).toBeVisible();
  });

  it("asks for the next and the previous page", async () => {
    const user: UserEvent = userEvent.setup();
    const { onPageChange }: Handlers = renderPagination(MIDDLE_PAGE);

    await user.click(screen.getByRole("button", { name: MESSAGES.LIST.NEXT_PAGE }));
    await user.click(screen.getByRole("button", { name: MESSAGES.LIST.PREVIOUS_PAGE }));

    expect(onPageChange.mock.calls).toEqual([[3], [1]]);
  });

  it("cannot go back from the first page", () => {
    renderPagination(FIRST_PAGE);

    expect(screen.getByRole("button", { name: MESSAGES.LIST.PREVIOUS_PAGE })).toBeDisabled();
    expect(screen.getByRole("button", { name: MESSAGES.LIST.NEXT_PAGE })).toBeEnabled();
  });

  it("cannot go forward from the last page", () => {
    renderPagination(LAST_PAGE);

    expect(screen.getByRole("button", { name: MESSAGES.LIST.NEXT_PAGE })).toBeDisabled();
  });

  it("offers exactly 10, 25, 50 and 100 items per page and asks for the chosen size", async () => {
    const user: UserEvent = userEvent.setup();
    const { onPageSizeChange }: Handlers = renderPagination(MIDDLE_PAGE);

    await user.click(screen.getByRole("combobox", { name: MESSAGES.LIST.PAGE_SIZE }));
    const options: string[] = screen
      .getAllByRole("option")
      .map((option: HTMLElement): string => option.textContent ?? "");
    await user.click(screen.getByRole("option", { name: "25" }));

    expect(options).toEqual(["10", "25", "50", "100"]);
    expect(onPageSizeChange).toHaveBeenCalledWith(25);
  });
});
