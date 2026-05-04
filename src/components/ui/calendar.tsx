"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker> & {
  /** Reparte las columnas del mes a todo el ancho del contenedor (p. ej. modal de alquiler). */
  fullWidth?: boolean;
};

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  fullWidth = false,
  ...props
}: CalendarProps) {
  const cellClass = cn(
    "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected].day-range-end)]:rounded-r-md",
    props.mode === "range"
      ? "[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
      : "[&:has([aria-selected])]:rounded-md",
    fullWidth && "flex flex-1 min-w-0 basis-0 justify-center",
  );

  const dayClass = cn(
    buttonVariants({ variant: "ghost" }),
    "p-0 font-normal aria-selected:opacity-100",
    fullWidth
      ? "mx-auto h-10 w-full max-w-[2.75rem] rounded-md sm:h-11 sm:max-w-[3rem]"
      : "h-8 w-8",
  );

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", fullWidth && "w-full max-w-none", className)}
      classNames={{
        months: cn(
          "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
          fullWidth && "w-full",
        ),
        month: cn("space-y-4", fullWidth && "w-full min-w-0"),
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: cn("w-full border-collapse space-y-1", fullWidth && "min-w-0"),
        head_row: cn("flex", fullWidth && "w-full"),
        head_cell: cn(
          "text-muted-foreground rounded-md font-normal text-[0.8rem]",
          fullWidth ? "flex-1 min-w-0 basis-0 py-1.5 text-center" : "w-8",
        ),
        row: cn("flex w-full mt-2", fullWidth && "justify-stretch"),
        cell: cellClass,
        day: dayClass,
        day_range_start: "day-range-start",
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside:
          "day-outside text-muted-foreground aria-selected:bg-accent/50 aria-selected:text-muted-foreground",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ className, ...props }) => (
          <ChevronLeft className={cn("h-4 w-4", className)} {...props} />
        ),
        IconRight: ({ className, ...props }) => (
          <ChevronRight className={cn("h-4 w-4", className)} {...props} />
        ),
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
