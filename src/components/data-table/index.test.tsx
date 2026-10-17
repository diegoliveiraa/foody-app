import { createColumnHelper, type ColumnHelper } from "@tanstack/react-table";
import { render, screen, within } from "@testing-library/react";
import userEvent, { type UserEvent } from "@testing-library/user-event";
import { describe, expect, it, vi, type Mock } from "vitest";
import { SORT_DIRECTIONS } from "@/constants/sorting";
import type { SortOrder } from "@/utils/sort-param";
import type { DataTableColumns, DataTableFeatures } from "./features";
import { DataTable } from "./index";

interface Person {
  id: string;
  name: string;
  email: string;
}

const helper: ColumnHelper<DataTableFeatures, Person> = createColumnHelper<
  DataTableFeatures,
  Person
>();

const COLUMNS: DataTableColumns<Person> = helper.columns([
  helper.accessor("name", { header: "Nome" }),
  helper.accessor("email", { header: "E-mail" }),
  helper.display({ id: "actions", header: "Ações", cell: () => "…" }),
]);

const PEOPLE: Person[] = [
  { id: "p-1", name: "Ana", email: "ana@foody.dev" },
  { id: "p-2", name: "Bruno", email: "bruno@foody.dev" },
];

const BY_NAME: SortOrder = { property: "name", direction: SORT_DIRECTIONS.ASC };

const LABEL: string = "Pessoas";

const EMPTY_TEXT: string = "Ninguém por aqui";

interface TableSetup {
  data?: Person[];
  sort?: SortOrder;
  loading?: boolean;
}

function renderTable({ data = PEOPLE, sort = BY_NAME, loading = false }: TableSetup = {}): Mock<
  (sort: SortOrder) => void
> {
  const onSortChange: Mock<(sort: SortOrder) => void> = vi.fn();
  render(
    <DataTable
      label={LABEL}
      columns={COLUMNS}
      data={data}
      getRowId={(person: Person): string => person.id}
      sort={sort}
      onSortChange={onSortChange}
      loading={loading}
      emptyState={EMPTY_TEXT}
    />,
  );
  return onSortChange;
}

function header(name: string): HTMLElement {
  return screen.getByRole("columnheader", { name });
}

describe("DataTable", () => {
  it("renders a header per column and a row per item", () => {
    renderTable();

    const table: HTMLElement = screen.getByRole("table", { name: LABEL });
    const rows: HTMLElement[] = within(table).getAllByRole("row");
    expect(within(rows[0] as HTMLElement).getAllByRole("columnheader")).toHaveLength(3);
    expect(rows).toHaveLength(3);
    expect(within(rows[1] as HTMLElement).getByText("ana@foody.dev")).toBeVisible();
  });

  it("marks the column the list is sorted by and the order", () => {
    renderTable({ sort: { property: "email", direction: SORT_DIRECTIONS.DESC } });

    expect(header("E-mail")).toHaveAttribute("aria-sort", "descending");
    expect(header("Nome")).toHaveAttribute("aria-sort", "none");
  });

  it("asks for the descending order when the sorted column is clicked again", async () => {
    const user: UserEvent = userEvent.setup();
    const onSortChange: Mock<(sort: SortOrder) => void> = renderTable();

    await user.click(within(header("Nome")).getByRole("button"));

    expect(onSortChange).toHaveBeenCalledWith({ property: "name", direction: "desc" });
  });

  it("goes back to ascending when a descending column is clicked again", async () => {
    const user: UserEvent = userEvent.setup();
    const onSortChange: Mock<(sort: SortOrder) => void> = renderTable({
      sort: { property: "name", direction: SORT_DIRECTIONS.DESC },
    });

    await user.click(within(header("Nome")).getByRole("button"));

    expect(onSortChange).toHaveBeenCalledWith({ property: "name", direction: "asc" });
  });

  it("sorts another column in ascending order first", async () => {
    const user: UserEvent = userEvent.setup();
    const onSortChange: Mock<(sort: SortOrder) => void> = renderTable();

    await user.click(within(header("E-mail")).getByRole("button"));

    expect(onSortChange).toHaveBeenCalledWith({ property: "email", direction: "asc" });
  });

  it("offers no sorting on a column without values", () => {
    renderTable();

    expect(within(header("Ações")).queryByRole("button")).toBeNull();
    expect(header("Ações")).not.toHaveAttribute("aria-sort");
  });

  it("keeps the headers and shows placeholder rows while loading", () => {
    renderTable({ data: [], loading: true });

    const table: HTMLElement = screen.getByRole("table", { name: LABEL });
    expect(table).toHaveAttribute("aria-busy", "true");
    expect(within(table).getAllByRole("columnheader")).toHaveLength(3);
    expect(within(table).queryByText(EMPTY_TEXT)).toBeNull();
  });

  it("shows the empty content across the table when there are no items", () => {
    renderTable({ data: [] });

    const cell: HTMLElement = screen.getByRole("cell", { name: EMPTY_TEXT });
    expect(cell).toHaveAttribute("colspan", "3");
  });
});
