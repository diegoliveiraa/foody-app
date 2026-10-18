import type { JSX } from "react";
import { Bar, BarChart, XAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCount } from "@/utils/format-number";
import { DASHBOARD_MESSAGES } from "../constants/messages";
import type { ChartPoint, OrdersChart } from "../types";
import { DashboardSection } from "./dashboard-section";

interface ChartMargin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

type BarRadius = [number, number, number, number];

const COUNT_KEY: keyof ChartPoint = "count";

const LABEL_KEY: keyof ChartPoint = "label";

const CHART_CONFIG: ChartConfig = {
  [COUNT_KEY]: { label: DASHBOARD_MESSAGES.CHART_COUNT, color: "var(--primary)" },
};

const BAR_FILL: string = `var(--color-${COUNT_KEY})`;

const BAR_RADIUS: BarRadius = [4, 4, 0, 0];

const CHART_MARGIN: ChartMargin = { top: 4, right: 12, bottom: 0, left: 12 };

const TICK_MARGIN: number = 8;

const EVERY_TICK: number = 0;

function ChartTable({ chart }: { chart: OrdersChart }): JSX.Element {
  return (
    <div className="sr-only">
      <Table>
        <TableCaption>{chart.label}</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead scope="col">{chart.bucketHeader}</TableHead>
            <TableHead scope="col">{DASHBOARD_MESSAGES.CHART_COUNT}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {chart.points.map((point: ChartPoint): JSX.Element => (
            <TableRow key={point.key}>
              <TableHead scope="row">{point.fullLabel}</TableHead>
              <TableCell>{formatCount(point.count)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function OrdersChartSection({ chart }: { chart: OrdersChart }): JSX.Element {
  return (
    <DashboardSection title={chart.title}>
      <div role="img" aria-label={chart.label}>
        <ChartContainer config={CHART_CONFIG} className="aspect-auto h-40 w-full">
          <BarChart data={chart.points} margin={CHART_MARGIN} accessibilityLayer={false}>
            <XAxis
              dataKey={LABEL_KEY}
              ticks={chart.ticks}
              interval={EVERY_TICK}
              tickLine={false}
              axisLine={false}
              tickMargin={TICK_MARGIN}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideIndicator />} />
            <Bar
              dataKey={COUNT_KEY}
              fill={BAR_FILL}
              radius={BAR_RADIUS}
              isAnimationActive={false}
            />
          </BarChart>
        </ChartContainer>
      </div>
      <ChartTable chart={chart} />
    </DashboardSection>
  );
}
