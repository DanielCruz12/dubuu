"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/lib/i18n-context";

export default function LandingSearchWidget() {
  const { t } = useLanguage();
  const router = useRouter();
  const [experienceType, setExperienceType] = useState<string>("all");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (experienceType !== "all") params.set("type", experienceType);
    const qs = params.toString();
    router.push(qs ? `/home?${qs}` : "/home");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-3xl mx-auto rounded-2xl md:rounded-full bg-white/[0.06] backdrop-blur-xl shadow-2xl border border-white/10 p-2 md:p-2 flex flex-col md:flex-row md:items-center gap-1.5 md:gap-0"
      role="search"
      aria-label={t("landing.search.ariaLabel")}
    >
      <div className="flex-1 min-w-0 flex items-center gap-3 px-4 py-2.5 md:py-2 rounded-xl md:rounded-full hover:bg-white/5 transition-colors">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/[0.04]">
          <Compass className="h-4 w-4 text-zinc-300" aria-hidden="true" />
        </span>
        <div className="flex-1 min-w-0 text-left">
          <label
            htmlFor="landing-experience-type"
            className="block text-[11px] font-semibold uppercase tracking-wide text-zinc-400"
          >
            {t("landing.search.typeLabel")}
          </label>
          <Select value={experienceType} onValueChange={setExperienceType}>
            <SelectTrigger
              id="landing-experience-type"
              className="h-auto border-none bg-transparent p-0 shadow-none text-sm text-white focus:ring-0 [&>svg]:hidden"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-white/10 bg-zinc-900 text-white">
              <SelectItem
                value="all"
                className="focus:bg-white/10 focus:text-white"
              >
                {t("landing.search.typeAll")}
              </SelectItem>
              <SelectItem
                value="tours"
                className="focus:bg-white/10 focus:text-white"
              >
                {t("landing.search.typeTours")}
              </SelectItem>
              <SelectItem
                value="rental"
                className="focus:bg-white/10 focus:text-white"
              >
                {t("landing.search.typeRental")}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button
        type="submit"
        size="lg"
        className="w-full md:w-auto rounded-xl md:rounded-full bg-white text-zinc-950 hover:bg-zinc-200 gap-2 shrink-0"
      >
        <Search className="h-4 w-4" aria-hidden="true" />
        {t("landing.search.cta")}
      </Button>
    </form>
  );
}
