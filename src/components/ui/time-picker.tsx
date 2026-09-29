"use client";

import { useState } from "react";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n-context";

function to12h(value: string) {
  const [h, m] = value.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 || 12;
  return { hour12, minutes: m, period: period as "AM" | "PM" };
}

function to24h(hour12: number, minutes: number, period: "AM" | "PM") {
  let h = hour12;
  if (period === "PM" && h !== 12) h += 12;
  if (period === "AM" && h === 12) h = 0;
  return `${String(h).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

const MINUTES = [0, 15, 30, 45];
const HOURS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

interface TimePickerProps {
  value: string;
  onChange: (value: string) => void;
  /** Usa el selector de hora nativo del dispositivo, sin Popover — para sheets móviles */
  inline?: boolean;
}

function TimePickerContent({
  hour12,
  minutes,
  period,
  selectHour,
  selectMinute,
  setPeriod,
  t,
}: {
  hour12: number;
  minutes: number;
  period: "AM" | "PM";
  selectHour: (h: number) => void;
  selectMinute: (m: number) => void;
  setPeriod: (p: "AM" | "PM") => void;
  t: (key: string) => string;
}) {
  return (
    <div className="space-y-3">
      <div className="flex rounded-lg border border-border/60 p-0.5 bg-muted/30">
        {(["AM", "PM"] as const).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPeriod(p)}
            className={cn(
              "flex-1 rounded-md px-3 py-1 text-xs font-medium transition-colors",
              period === p
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {p}
          </button>
        ))}
      </div>

      <div className="space-y-1">
        <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">
          {t("home.timePicker.hour")}
        </p>
        <div className="grid grid-cols-4 gap-1">
          {HOURS.map((h) => (
            <button
              key={h}
              type="button"
              onClick={() => selectHour(h)}
              className={cn(
                "rounded-md px-2 py-1.5 text-sm tabular-nums transition-colors",
                hour12 === h
                  ? "bg-primary text-primary-foreground font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {h}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1">
        <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">
          {t("home.timePicker.minutes")}
        </p>
        <div className="grid grid-cols-4 gap-1">
          {MINUTES.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => selectMinute(m)}
              className={cn(
                "rounded-md px-2 py-1.5 text-sm tabular-nums transition-colors",
                minutes === m
                  ? "bg-primary text-primary-foreground font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {String(m).padStart(2, "0")}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function TimePicker({ value, onChange, inline = false }: TimePickerProps) {
  const [open, setOpen] = useState(false);
  const { t } = useLanguage();
  const { hour12, minutes, period } = to12h(value);

  const display = `${hour12}:${String(minutes).padStart(2, "0")} ${period}`;

  const selectHour = (h: number) => {
    onChange(to24h(h, minutes, period));
  };

  const selectMinute = (m: number) => {
    onChange(to24h(hour12, m, period));
  };

  const setPeriod = (p: "AM" | "PM") => {
    onChange(to24h(hour12, minutes, p));
  };

  if (inline) {
    return (
      <input
        type="time"
        step={900}
        value={value}
        onChange={(e) => {
          if (e.target.value) onChange(e.target.value);
        }}
        className="h-11 w-full rounded-lg border border-border/60 bg-background/80 px-3 text-base tabular-nums text-foreground dark:[color-scheme:dark] focus:outline-none focus:ring-2 focus:ring-primary/30"
      />
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="w-full justify-between gap-2 bg-background/80 font-normal"
        >
          <span className="tabular-nums">{display}</span>
          <Clock className="h-3.5 w-3.5 shrink-0 opacity-60" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={6}
        className="w-auto p-3 z-[99999]"
      >
        <TimePickerContent
          hour12={hour12}
          minutes={minutes}
          period={period}
          selectHour={selectHour}
          selectMinute={selectMinute}
          setPeriod={setPeriod}
          t={t}
        />
      </PopoverContent>
    </Popover>
  );
}
