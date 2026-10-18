import type { JSX } from "react";
import type { DashboardPeriod } from "@/@types/dashboard";
import { RadioGroup, RadioGroupSegment } from "@/components/ui/radio-group";
import { DASHBOARD_PERIOD_LIST } from "../constants";
import { DASHBOARD_MESSAGES, PERIOD_LABELS } from "../constants/messages";
import { parsePeriod } from "../utils/period-param";

interface PeriodPickerProps {
  period: DashboardPeriod;
  onChange: (period: DashboardPeriod) => void;
}

export function PeriodPicker({ period, onChange }: PeriodPickerProps): JSX.Element {
  return (
    <RadioGroup
      value={period}
      onValueChange={(value: string): void => onChange(parsePeriod(value))}
      aria-label={DASHBOARD_MESSAGES.PERIOD}
      className="grid-cols-3 gap-1 rounded-[14px] bg-muted p-1 md:max-w-md"
    >
      {DASHBOARD_PERIOD_LIST.map((option: DashboardPeriod): JSX.Element => (
        <RadioGroupSegment key={option} value={option}>
          {PERIOD_LABELS[option]}
        </RadioGroupSegment>
      ))}
    </RadioGroup>
  );
}
