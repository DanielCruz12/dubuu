"use client";

import { format, startOfWeek, startOfMonth, startOfYear, endOfDay } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n-context";

export type DatePreset = "week" | "month" | "year" | "custom";

const now = new Date();
const PRESET_DATES: Record<Exclude<DatePreset, "custom">, { from: Date; to: Date }> = {
  week: { from: startOfWeek(now, { weekStartsOn: 1 }), to: endOfDay(now) },
  month: { from: startOfMonth(now), to: endOfDay(now) },
  year: { from: startOfYear(now), to: endOfDay(now) },
};

interface PeriodFilterProps {
  datePreset: DatePreset;
  onDatePresetChange: (p: DatePreset) => void;
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
  onDateFromChange: (d: Date | undefined) => void;
  onDateToChange: (d: Date | undefined) => void;
}

/** Selector de período; el rango de fechas solo aparece con "Personalizado". */
export function PayoutPeriodFilter({
  datePreset,
  onDatePresetChange,
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
}: PeriodFilterProps) {
  const { t } = useLanguage();

  const presetKeys: DatePreset[] = ["week", "month", "year", "custom"];

  const handlePresetChange = (preset: DatePreset) => {
    onDatePresetChange(preset);
    if (preset !== "custom") {
      const range = PRESET_DATES[preset];
      onDateFromChange(range.from);
      onDateToChange(range.to);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="min-w-[120px] justify-between font-normal">
            {t(`payouts.filters.period.${datePreset}`)}
            <ChevronDown className="ml-2 h-3 w-3 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {presetKeys.map((key) => (
            <DropdownMenuItem key={key} onClick={() => handlePresetChange(key)}>
              {t(`payouts.filters.period.${key}`)}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {datePreset === "custom" && (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn("min-w-[190px] justify-start font-normal", !dateFrom && "text-muted-foreground")}
            >
              <CalendarIcon className="mr-2 h-3 w-3 opacity-50" />
              {dateFrom && dateTo
                ? `${format(dateFrom, "dd MMM", { locale: es })} - ${format(dateTo, "dd MMM", { locale: es })}`
                : t("payouts.filters.dateRange")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              selected={{ from: dateFrom, to: dateTo }}
              onSelect={(range) => {
                if (range) {
                  onDateFromChange(range.from);
                  onDateToChange(range.to);
                }
              }}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      )}
    </>
  );
}
