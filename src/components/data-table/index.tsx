import {
  FlexRender,
  functionalUpdate,
  useTable,
  type Cell,
  type Header,
  type HeaderGroup,
  type ReactTable,
  type Row,
  type RowData,
  type SortingState,
  type Updater,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown, type LucideIcon } from "lucide-react";
import { useMemo, type AriaAttributes, type JSX, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SORT_DIRECTIONS, type SortDirection } from "@/constants/sorting";
import type { SortOrder } from "@/utils/sort-param";
import { DATA_TABLE_FEATURES, type DataTableColumns, type DataTableFeatures } from "./features";

interface DataTableProps<TData extends RowData> {
  label: string;
  columns: DataTableColumns<TData>;
  data: ReadonlyArray<TData>;
  getRowId: (row: TData) => string;
  sort: SortOrder;
  onSortChange: (sort: SortOrder) => void;
  loading?: boolean;
  emptyState?: ReactNode;
}

type SortState = SortDirection | typeof UNSORTED;

type DataTableInstance<TData extends RowData> = ReactTable<DataTableFeatures, TData>;

const UNSORTED = "none" as const;

const SKELETON_ROWS: number = 5;

const ARIA_SORT: Record<SortState, AriaAttributes["aria-sort"]> = {
  [SORT_DIRECTIONS.ASC]: "ascending",
  [SORT_DIRECTIONS.DESC]: "descending",
  [UNSORTED]: "none",
};

const SORT_ICONS: Record<SortState, LucideIcon> = {
  [SORT_DIRECTIONS.ASC]: ArrowUp,
  [SORT_DIRECTIONS.DESC]: ArrowDown,
  [UNSORTED]: ArrowUpDown,
};

function toSortingState({ property, direction }: SortOrder): SortingState {
  return [{ id: property, desc: direction === SORT_DIRECTIONS.DESC }];
}

function toSortOrder(sorting: SortingState, current: SortOrder): SortOrder {
  const [first] = sorting;
  if (first === undefined) {
    return current;
  }
  return {
    property: first.id,
    direction: first.desc ? SORT_DIRECTIONS.DESC : SORT_DIRECTIONS.ASC,
  };
}

function SortableHead<TData extends RowData>({
  header,
}: {
  header: Header<DataTableFeatures, TData, unknown>;
}): JSX.Element {
  const state: SortState = header.column.getIsSorted() || UNSORTED;
  const Icon: LucideIcon = SORT_ICONS[state];

  return (
    <TableHead aria-sort={ARIA_SORT[state]} className="px-1">
      <Button
        variant="ghost"
        className="px-2 font-medium text-muted-foreground hover:text-foreground"
        onClick={header.column.getToggleSortingHandler()}
      >
        <FlexRender header={header} />
        <Icon aria-hidden="true" />
      </Button>
    </TableHead>
  );
}

function DataTableHead<TData extends RowData>({
  header,
}: {
  header: Header<DataTableFeatures, TData, unknown>;
}): JSX.Element {
  if (header.column.getCanSort()) {
    return <SortableHead header={header} />;
  }
  return <TableHead>{header.isPlaceholder ? null : <FlexRender header={header} />}</TableHead>;
}

function SkeletonRows({ columnCount }: { columnCount: number }): JSX.Element {
  return (
    <>
      {Array.from({ length: SKELETON_ROWS }, (_row: unknown, rowIndex: number): JSX.Element => (
        <TableRow key={rowIndex}>
          {Array.from({ length: columnCount }, (_cell: unknown, cellIndex: number): JSX.Element => (
            <TableCell key={cellIndex}>
              <Skeleton className="h-5 w-full max-w-32" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

function DataRows<TData extends RowData>({
  table,
}: {
  table: DataTableInstance<TData>;
}): JSX.Element {
  return (
    <>
      {table.getRowModel().rows.map((row: Row<DataTableFeatures, TData>): JSX.Element => (
        <TableRow key={row.id}>
          {row.getAllCells().map((cell: Cell<DataTableFeatures, TData, unknown>): JSX.Element => (
            <TableCell key={cell.id}>
              <FlexRender cell={cell} />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

export function DataTable<TData extends RowData>({
  label,
  columns,
  data,
  getRowId,
  sort,
  onSortChange,
  loading = false,
  emptyState,
}: DataTableProps<TData>): JSX.Element {
  const sorting: SortingState = useMemo((): SortingState => toSortingState(sort), [sort]);
  const table: DataTableInstance<TData> = useTable({
    features: DATA_TABLE_FEATURES,
    columns,
    data,
    getRowId,
    state: { sorting },
    onSortingChange: (updater: Updater<SortingState>): void =>
      onSortChange(toSortOrder(functionalUpdate(updater, sorting), sort)),
    manualSorting: true,
    enableSortingRemoval: false,
    enableMultiSort: false,
    sortDescFirst: false,
  });
  const columnCount: number = table.getAllLeafColumns().length;
  const empty: boolean = !loading && data.length === 0;

  return (
    <div className="rounded-xl border bg-card">
      <Table aria-label={label} aria-busy={loading}>
        <TableHeader>
          {table
            .getHeaderGroups()
            .map((group: HeaderGroup<DataTableFeatures, TData>): JSX.Element => (
              <TableRow key={group.id} className="hover:bg-transparent">
                {group.headers.map(
                  (header: Header<DataTableFeatures, TData, unknown>): JSX.Element => (
                    <DataTableHead key={header.id} header={header} />
                  ),
                )}
              </TableRow>
            ))}
        </TableHeader>
        <TableBody>
          {loading && <SkeletonRows columnCount={columnCount} />}
          {empty && (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={columnCount} className="whitespace-normal">
                {emptyState}
              </TableCell>
            </TableRow>
          )}
          {!loading && !empty && <DataRows table={table} />}
        </TableBody>
      </Table>
    </div>
  );
}
