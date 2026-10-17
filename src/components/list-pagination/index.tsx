import { ChevronLeft, ChevronRight } from "lucide-react";
import { useId, type JSX } from "react";
import type { PageMeta } from "@/@types/pagination";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MESSAGES } from "@/constants/messages";
import { FIRST_PAGE, PAGE_SIZES, type PageSize } from "@/constants/pagination";

interface ListPaginationProps {
  meta: PageMeta;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: PageSize) => void;
}

const PAGE_STEP: number = 1;

const FIRST_POSITION: number = 1;

interface ItemRange {
  first: number;
  last: number;
}

function rangeOf({ page, pageSize, totalItems }: PageMeta): ItemRange {
  return {
    first: Math.min((page - FIRST_PAGE) * pageSize + FIRST_POSITION, totalItems),
    last: Math.min(page * pageSize, totalItems),
  };
}

function toPageSize(value: string): PageSize | undefined {
  return PAGE_SIZES.find((size: PageSize): boolean => String(size) === value);
}

export function ListPagination({
  meta,
  onPageChange,
  onPageSizeChange,
}: ListPaginationProps): JSX.Element {
  const pageSizeLabelId: string = useId();
  const { first, last }: ItemRange = rangeOf(meta);

  const choosePageSize = (value: string): void => {
    const pageSize: PageSize | undefined = toPageSize(value);
    if (pageSize === undefined) {
      return;
    }
    onPageSizeChange(pageSize);
  };

  return (
    <nav
      aria-label={MESSAGES.LIST.PAGINATION}
      className="flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span id={pageSizeLabelId}>{MESSAGES.LIST.PAGE_SIZE}</span>
        <Select value={String(meta.pageSize)} onValueChange={choosePageSize}>
          <SelectTrigger aria-labelledby={pageSizeLabelId} className="w-24 text-foreground">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PAGE_SIZES.map((pageSize: PageSize): JSX.Element => (
              <SelectItem key={pageSize} value={String(pageSize)}>
                {pageSize}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span>{MESSAGES.LIST.RANGE(first, last, meta.totalItems)}</span>
      </div>
      <div className="flex items-center justify-between gap-3 sm:justify-end">
        <Button
          variant="outline"
          size="icon"
          aria-label={MESSAGES.LIST.PREVIOUS_PAGE}
          disabled={!meta.hasPrevious}
          onClick={(): void => onPageChange(meta.page - PAGE_STEP)}
        >
          <ChevronLeft aria-hidden="true" />
        </Button>
        <span className="font-medium whitespace-nowrap text-foreground">
          {MESSAGES.LIST.PAGE_OF(meta.page, Math.max(meta.totalPages, FIRST_PAGE))}
        </span>
        <Button
          variant="outline"
          size="icon"
          aria-label={MESSAGES.LIST.NEXT_PAGE}
          disabled={!meta.hasNext}
          onClick={(): void => onPageChange(meta.page + PAGE_STEP)}
        >
          <ChevronRight aria-hidden="true" />
        </Button>
      </div>
    </nav>
  );
}
