"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { DateRange } from "react-day-picker";
import { MapPin, CalendarDays, Search, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/lib/i18n-context";

export default function LandingSearchWidget() {
  const { t, language } = useLanguage();
  const router = useRouter();
  const [destination, setDestination] = useState("");
  const [range, setRange] = useState<DateRange | undefined>(undefined);
  const [experienceType, setExperienceType] = useState<string>("all");
  const [isDatesOpen, setIsDatesOpen] = useState(false);

  const dateLabel = (() => {
    if (!range?.from) return t("landing.search.datesPlaceholder");
    const fmt = (d: Date) =>
      d.toLocaleDateString(language === "es" ? "es-ES" : "en-US", {
        day: "2-digit",
        month: "short",
      });
    if (range.to) return `${fmt(range.from)} - ${fmt(range.to)}`;
    return fmt(range.from);
  })();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (destination.trim()) params.set("q", destination.trim());
    if (experienceType !== "all") params.set("type", experienceType);
    if (range?.from) params.set("from", range.from.toISOString().slice(0, 10));
    if (range?.to) params.set("to", range.to.toISOString().slice(0, 10));
    const qs = params.toString();
    router.push(qs ? `/home?${qs}` : "/home");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-3xl mx-auto rounded-2xl md:rounded-full bg-white/95 backdrop-blur-md shadow-2xl border border-white/60 p-2 md:p-2 flex flex-col md:flex-row md:items-center gap-1.5 md:gap-0"
      role="search"
      aria-label={t("landing.search.ariaLabel")}
    >
      <div className="flex-1 min-w-0 flex items-center gap-2 px-4 py-2.5 md:py-2 rounded-xl md:rounded-full hover:bg-coast-50/70 transition-colors">
        <MapPin
          className="h-4 w-4 text-coast-600 shrink-0"
          aria-hidden="true"
        />
        <div className="flex-1 min-w-0 text-left">
          <label
            htmlFor="landing-destination"
            className="block text-[11px] font-semibold uppercase tracking-wide text-coast-700"
          >
            {t("landing.search.destinationLabel")}
          </label>
          <Input
            id="landing-destination"
            name="landing-destination"
            autoComplete="off"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder={t("landing.search.destinationPlaceholder")}
            className="h-auto border-none p-0 shadow-none text-sm text-gray-900 placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0 autofill:shadow-[inset_0_0_0px_1000px_white] autofill:[-webkit-text-fill-color:theme(colors.gray.900)]"
          />
        </div>
      </div>

      <div
        className="hidden md:block h-8 w-px bg-border/60 shrink-0"
        aria-hidden="true"
      />

      <Popover open={isDatesOpen} onOpenChange={setIsDatesOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="flex-1 min-w-0 flex items-center gap-2 px-4 py-2.5 md:py-2 rounded-xl md:rounded-full hover:bg-coast-50/70 transition-colors text-left"
          >
            <CalendarDays
              className="h-4 w-4 text-coast-600 shrink-0"
              aria-hidden="true"
            />
            <div className="min-w-0">
              <span className="block text-[11px] font-semibold uppercase tracking-wide text-coast-700">
                {t("landing.search.datesLabel")}
              </span>
              <span className="block truncate text-sm text-gray-900">
                {dateLabel}
              </span>
            </div>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" align="start">
          <Calendar
            mode="range"
            selected={range}
            onSelect={setRange}
            numberOfMonths={1}
            fromDate={new Date()}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      <div
        className="hidden md:block h-8 w-px bg-border/60 shrink-0"
        aria-hidden="true"
      />

      <div className="flex-1 min-w-0 flex items-center gap-2 px-4 py-2.5 md:py-2 rounded-xl md:rounded-full hover:bg-coast-50/70 transition-colors">
        <Compass
          className="h-4 w-4 text-coast-600 shrink-0"
          aria-hidden="true"
        />
        <div className="flex-1 min-w-0 text-left">
          <label
            htmlFor="landing-experience-type"
            className="block text-[11px] font-semibold uppercase tracking-wide text-coast-700"
          >
            {t("landing.search.typeLabel")}
          </label>
          <Select value={experienceType} onValueChange={setExperienceType}>
            <SelectTrigger
              id="landing-experience-type"
              className="h-auto border-none p-0 shadow-none text-sm text-gray-900 focus:ring-0 [&>svg]:hidden"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {t("landing.search.typeAll")}
              </SelectItem>
              <SelectItem value="tours">
                {t("landing.search.typeTours")}
              </SelectItem>
              <SelectItem value="rental">
                {t("landing.search.typeRental")}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button
        type="submit"
        size="lg"
        className="w-full md:w-auto rounded-xl md:rounded-full bg-coast-600 hover:bg-coast-700 text-white gap-2 shrink-0"
      >
        <Search className="h-4 w-4" aria-hidden="true" />
        {t("landing.search.cta")}
      </Button>
    </form>
  );
}
