"use client";

import { useState } from "react";
import { format, startOfWeek, startOfMonth, startOfYear, endOfDay } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, ChevronDown, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n-context";
import type { HostOption } from "@/types/payout";

export type DatePreset = "week" | "month" | "year" | "custom";

interface Props {
  datePreset: DatePreset;
  onDatePresetChange: (p: DatePreset) => void;
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
  onDateFromChange: (d: Date | undefined) => void;
  onDateToChange: (d: Date | undefined) => void;
  hostId: string | undefined;
  onHostIdChange: (id: string | undefined) => void;
  hosts: HostOption[];
}

const now = new Date();
const PRESET_DATES: Record<Exclude<DatePreset, "custom">, { from: Date; to: Date }> = {
  week: { from: startOfWeek(now, { weekStartsOn: 1 }), to: endOfDay(now) },
  month: { from: startOfMonth(now), to: endOfDay(now) },
  year: { from: startOfYear(now), to: endOfDay(now) },
};

export function PayoutsFilters({
  datePreset,
  onDatePresetChange,
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  hostId,
  onHostIdChange,
  hosts,
}: Props) {
  const { t } = useLanguage();
  const [hostOpen, setHostOpen] = useState(false);

  const selectedHost = hosts.find((h) => h.id === hostId);

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
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex flex-wrap items-center gap-2 flex-1">
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
                  if (range.from || range.to) onDatePresetChange("custom");
                }
              }}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>

        <Popover open={hostOpen} onOpenChange={setHostOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="min-w-[160px] justify-between font-normal">
              <span className={!selectedHost ? "text-muted-foreground" : ""}>
                {selectedHost ? selectedHost.name : t("payouts.filters.allHosts")}
              </span>
              <ChevronDown className="ml-2 h-3 w-3 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0" align="start">
            <Command>
              <CommandInput placeholder={t("payouts.filters.searchHost")} />
              <CommandList>
                <CommandEmpty>{t("payouts.filters.noHostsFound")}</CommandEmpty>
                <CommandGroup>
                  <CommandItem onSelect={() => { onHostIdChange(undefined); setHostOpen(false); }}>
                    {t("payouts.filters.allHosts")}
                  </CommandItem>
                  {hosts.map((h) => (
                    <CommandItem key={h.id} onSelect={() => { onHostIdChange(h.id); setHostOpen(false); }}>
                      {h.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      <Button variant="outline" size="sm" className="font-normal">
        <Download className="mr-2 h-3 w-3" />
        {t("payouts.filters.export")}
      </Button>
    </div>
  );
}
