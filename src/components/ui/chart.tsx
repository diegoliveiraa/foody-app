import { cn } from "cn";
import {
  createContext,
  useContext,
  useId,
  useMemo,
  type ComponentProps,
  type ComponentType,
  type CSSProperties,
  type JSX,
  type ReactNode,
} from "react";
import {
  Legend,
  ResponsiveContainer,
  Tooltip,
  type DefaultLegendContentProps,
  type DefaultTooltipContentProps,
  type LegendPayload,
  type TooltipPayloadEntry,
  type TooltipValueType,
} from "recharts";
import { APP_LOCALE } from "@/constants/locale";

type TooltipNameType = number | string;

type TooltipIndicator = "line" | "dot" | "dashed";

type ChartTooltipEntry = TooltipPayloadEntry<TooltipValueType, TooltipNameType>;

type ChartTooltipFormatter = DefaultTooltipContentProps<
  TooltipValueType,
  TooltipNameType
>["formatter"];

interface ChartConfigItem {
  label?: ReactNode;
  icon?: ComponentType;
  color?: string;
}

export type ChartConfig = Record<string, ChartConfigItem>;

interface ChartContextProps {
  config: ChartConfig;
}

interface ChartDimension {
  width: number;
  height: number;
}

type ChartContainerProps = ComponentProps<"div"> & {
  config: ChartConfig;
  children: ComponentProps<typeof ResponsiveContainer>["children"];
  initialDimension?: ChartDimension;
};

type ChartTooltipContentProps = ComponentProps<typeof Tooltip> &
  ComponentProps<"div"> & {
    hideLabel?: boolean;
    hideIndicator?: boolean;
    indicator?: TooltipIndicator;
    nameKey?: string;
    labelKey?: string;
  } & Omit<DefaultTooltipContentProps<TooltipValueType, TooltipNameType>, "accessibilityLayer">;

interface TooltipItemProps {
  item: ChartTooltipEntry;
  index: number;
  entries: readonly ChartTooltipEntry[];
  config: ChartConfig;
  formatter: ChartTooltipFormatter;
  indicator: TooltipIndicator;
  hideIndicator: boolean;
  nestLabel: boolean;
  tooltipLabel: ReactNode;
  color: string | undefined;
  nameKey: string | undefined;
}

interface TooltipMarkerProps {
  itemConfig: ChartConfigItem | undefined;
  hideIndicator: boolean;
  indicator: TooltipIndicator;
  nestLabel: boolean;
  color: string | undefined;
}

type ChartLegendContentProps = ComponentProps<"div"> & {
  hideIcon?: boolean;
  nameKey?: string;
} & DefaultLegendContentProps;

const OUTSIDE_CONTAINER_ERROR: string = "useChart must be used within a <ChartContainer />";

const INITIAL_DIMENSION: ChartDimension = { width: 320, height: 200 };

const CHART_ID_PREFIX: string = "chart-";

const ID_SEPARATORS: RegExp = /:/g;

const NO_SEPARATOR: string = "";

const DEFAULT_VALUE_KEY: string = "value";

const HIDDEN_ENTRY_TYPE: string = "none";

const SINGLE_ENTRY: number = 1;

const VARIABLE_SEPARATOR: string = "\n";

const INDICATOR_CLASSES: Record<TooltipIndicator, string> = {
  dot: "h-2.5 w-2.5",
  line: "w-1",
  dashed: "w-0 border-[1.5px] border-dashed bg-transparent",
};

const NO_TOOLTIP_ENTRIES: readonly ChartTooltipEntry[] = [];

const NO_LEGEND_ENTRIES: readonly LegendPayload[] = [];

const ChartContext = createContext<ChartContextProps | null>(null);

function useChart(): ChartContextProps {
  const context: ChartContextProps | null = useContext(ChartContext);
  if (!context) {
    throw new Error(OUTSIDE_CONTAINER_ERROR);
  }
  return context;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function stringAt(source: Record<string, unknown> | undefined, key: string): string | undefined {
  const value: unknown = source?.[key];
  return typeof value === "string" ? value : undefined;
}

function configForPayload(
  config: ChartConfig,
  payload: unknown,
  key: string,
): ChartConfigItem | undefined {
  if (!isRecord(payload)) {
    return undefined;
  }
  const inner: Record<string, unknown> | undefined = isRecord(payload.payload)
    ? payload.payload
    : undefined;
  const labelKey: string = stringAt(payload, key) ?? stringAt(inner, key) ?? key;
  return config[labelKey] ?? config[key];
}

function isEntryKey(candidate: unknown): candidate is string | number {
  return typeof candidate === "string" || typeof candidate === "number";
}

function entryKey(...candidates: unknown[]): string {
  const found: string | number | undefined = candidates.find(isEntryKey);
  return found === undefined ? DEFAULT_VALUE_KEY : String(found);
}

function payloadFill(payload: unknown): string | undefined {
  return isRecord(payload) ? stringAt(payload, "fill") : undefined;
}

function isVisibleEntry(item: { type?: string }): boolean {
  return item.type !== HIDDEN_ENTRY_TYPE;
}

function formatEntryValue(value: TooltipValueType): string {
  return typeof value === "number" ? value.toLocaleString(APP_LOCALE) : String(value);
}

function colorVariables(config: ChartConfig): string[] {
  return Object.entries(config).flatMap(([key, item]: [string, ChartConfigItem]): string[] =>
    item.color ? [`  --color-${key}: ${item.color};`] : [],
  );
}

function ChartStyle({ id, config }: { id: string; config: ChartConfig }): JSX.Element | null {
  const variables: string[] = colorVariables(config);

  if (variables.length === 0) {
    return null;
  }
  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `[data-chart=${id}] {${VARIABLE_SEPARATOR}${variables.join(VARIABLE_SEPARATOR)}${VARIABLE_SEPARATOR}}`,
      }}
    />
  );
}

function ChartContainer({
  id,
  className,
  children,
  config,
  initialDimension = INITIAL_DIMENSION,
  ...props
}: ChartContainerProps): JSX.Element {
  const uniqueId: string = useId();
  const chartId: string = `${CHART_ID_PREFIX}${id ?? uniqueId.replace(ID_SEPARATORS, NO_SEPARATOR)}`;
  const context: ChartContextProps = useMemo((): ChartContextProps => ({ config }), [config]);

  return (
    <ChartContext value={context}>
      <div
        data-slot="chart"
        data-chart={chartId}
        className={cn(
          "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-hidden [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border [&_.recharts-sector]:outline-hidden [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-surface]:outline-hidden",
          className,
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <ResponsiveContainer initialDimension={initialDimension}>{children}</ResponsiveContainer>
      </div>
    </ChartContext>
  );
}

const ChartTooltip: typeof Tooltip = Tooltip;

function TooltipMarker({
  itemConfig,
  hideIndicator,
  indicator,
  nestLabel,
  color,
}: TooltipMarkerProps): JSX.Element | null {
  const Icon: ComponentType | undefined = itemConfig?.icon;

  if (Icon) {
    return <Icon />;
  }
  if (hideIndicator) {
    return null;
  }
  return (
    <div
      className={cn(
        "shrink-0 rounded-[2px] border-(--color-border) bg-(--color-bg)",
        INDICATOR_CLASSES[indicator],
        nestLabel && indicator === "dashed" && "my-0.5",
      )}
      style={{ "--color-bg": color, "--color-border": color } as CSSProperties}
    />
  );
}

function TooltipItem({
  item,
  index,
  entries,
  config,
  formatter,
  indicator,
  hideIndicator,
  nestLabel,
  tooltipLabel,
  color,
  nameKey,
}: TooltipItemProps): JSX.Element {
  const key: string = entryKey(nameKey, item.name, item.dataKey);
  const itemConfig: ChartConfigItem | undefined = configForPayload(config, item, key);
  const value: TooltipValueType | undefined = item.value;

  if (formatter && value !== undefined && item.name) {
    return (
      <div className="flex w-full flex-wrap items-stretch gap-2">
        {formatter(value, item.name, item, index, entries)}
      </div>
    );
  }
  return (
    <div
      className={cn(
        "flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground",
        indicator === "dot" && "items-center",
      )}
    >
      <TooltipMarker
        itemConfig={itemConfig}
        hideIndicator={hideIndicator}
        indicator={indicator}
        nestLabel={nestLabel}
        color={color ?? payloadFill(item.payload) ?? item.color}
      />
      <div
        className={cn(
          "flex flex-1 justify-between leading-none",
          nestLabel ? "items-end" : "items-center",
        )}
      >
        <div className="grid gap-1.5">
          {nestLabel && tooltipLabel}
          <span className="text-muted-foreground">{itemConfig?.label ?? item.name}</span>
        </div>
        {value !== undefined && value !== null && (
          <span className="font-mono font-medium text-foreground tabular-nums">
            {formatEntryValue(value)}
          </span>
        )}
      </div>
    </div>
  );
}

function tooltipLabelValue(
  config: ChartConfig,
  first: ChartTooltipEntry | undefined,
  label: ReactNode,
  labelKey: string | undefined,
): ReactNode {
  if (!labelKey && typeof label === "string") {
    return config[label]?.label ?? label;
  }
  const key: string = entryKey(labelKey, first?.dataKey, first?.name);
  return configForPayload(config, first, key)?.label;
}

function ChartTooltipContent({
  active,
  payload,
  className,
  indicator = "dot",
  hideLabel = false,
  hideIndicator = false,
  label,
  labelFormatter,
  labelClassName,
  formatter,
  color,
  nameKey,
  labelKey,
}: ChartTooltipContentProps): JSX.Element | null {
  const { config }: ChartContextProps = useChart();
  const entries: readonly ChartTooltipEntry[] = payload ?? NO_TOOLTIP_ENTRIES;

  const tooltipLabel: ReactNode = useMemo((): ReactNode => {
    if (hideLabel || entries.length === 0) {
      return null;
    }
    const value: ReactNode = tooltipLabelValue(config, entries[0], label, labelKey);
    if (labelFormatter) {
      return (
        <div className={cn("font-medium", labelClassName)}>{labelFormatter(value, entries)}</div>
      );
    }
    if (!value) {
      return null;
    }
    return <div className={cn("font-medium", labelClassName)}>{value}</div>;
  }, [label, labelFormatter, entries, hideLabel, labelClassName, config, labelKey]);

  if (!active || entries.length === 0) {
    return null;
  }

  const nestLabel: boolean = entries.length === SINGLE_ENTRY && indicator !== "dot";

  return (
    <div
      className={cn(
        "grid min-w-32 items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl",
        className,
      )}
    >
      {!nestLabel && tooltipLabel}
      <div className="grid gap-1.5">
        {entries
          .filter(isVisibleEntry)
          .map((item: ChartTooltipEntry, index: number): JSX.Element => (
            <TooltipItem
              key={index}
              item={item}
              index={index}
              entries={entries}
              config={config}
              formatter={formatter}
              indicator={indicator}
              hideIndicator={hideIndicator}
              nestLabel={nestLabel}
              tooltipLabel={tooltipLabel}
              color={color}
              nameKey={nameKey}
            />
          ))}
      </div>
    </div>
  );
}

const ChartLegend: typeof Legend = Legend;

function ChartLegendContent({
  className,
  hideIcon = false,
  payload,
  verticalAlign = "bottom",
  nameKey,
}: ChartLegendContentProps): JSX.Element | null {
  const { config }: ChartContextProps = useChart();
  const entries: readonly LegendPayload[] = payload ?? NO_LEGEND_ENTRIES;

  if (entries.length === 0) {
    return null;
  }
  return (
    <div
      className={cn(
        "flex items-center justify-center gap-4",
        verticalAlign === "top" ? "pb-3" : "pt-3",
        className,
      )}
    >
      {entries.filter(isVisibleEntry).map((item: LegendPayload, index: number): JSX.Element => {
        const key: string = entryKey(nameKey, item.dataKey);
        const itemConfig: ChartConfigItem | undefined = configForPayload(config, item, key);
        const Icon: ComponentType | undefined = hideIcon ? undefined : itemConfig?.icon;

        return (
          <div
            key={index}
            className="flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted-foreground"
          >
            {Icon ? (
              <Icon />
            ) : (
              <div
                className="h-2 w-2 shrink-0 rounded-[2px]"
                style={{ backgroundColor: item.color }}
              />
            )}
            {itemConfig?.label}
          </div>
        );
      })}
    </div>
  );
}

export {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
  ChartTooltip,
  ChartTooltipContent,
};
