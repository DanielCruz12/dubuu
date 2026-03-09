"use client";

import { Check, ChevronDown } from "lucide-react";
import US from "country-flag-icons/react/3x2/US";
import SV from "country-flag-icons/react/3x2/SV";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/lib/i18n-context";
import {
  useAppDispatch,
  invalidateApiCacheOnLocaleChange,
} from "@/redux/store";

const languages = [
  { code: "en" as const, name: "English", short: "EN", flag: US },
  { code: "es" as const, name: "Español", short: "ES", flag: SV },
];

export function LanguageSelector() {
  const { language, setLanguage } = useLanguage();
  const dispatch = useAppDispatch();
  const current = languages.find((l) => l.code === language) ?? languages[0];

  const handleChange = (newCode: "es" | "en") => {
    setLanguage(newCode);
    // Refetch datos del API con el nuevo locale (?locale=en o ?locale=es)
    dispatch(invalidateApiCacheOnLocaleChange());
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="w-auto min-w-0 px-2 gap-1.5 sm:w-36 sm:justify-start sm:gap-2 sm:px-3"
        >
          <current.flag className="h-4 w-5 shrink-0" />
          <span className="hidden sm:inline">{current.name}</span>
          <span className="sm:hidden">{current.short}</span>
          <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-28">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleChange(lang.code)}
            className="gap-2 cursor-pointer"
          >
            <lang.flag className="h-4 w-5" />
            <span className="hidden sm:inline">{lang.name}</span>
            <span className="sm:hidden">{lang.short}</span>
            {language === lang.code && (
              <Check className="ml-auto h-4 w-4" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
