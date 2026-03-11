"use client";

import type React from "react";

import { useState } from "react";
import { Globe } from "lucide-react";
import * as Flags from "country-flag-icons/react/3x2";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import { countriesCurrency } from "@/utils/data";

const CURRENCY_CODE = "USD";

export default function CountryCurrencySelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [currencyCode, setCurrencyCode] = useState(CURRENCY_CODE);

  const selectedCurrency = countriesCurrency.find(
    (country) => country.currencyCode === currencyCode
  );

  return (
    <div className="flex items-center justify-center min-h-[300px]">
      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerTrigger asChild>
          <Button variant="outline">
            <span className="flex flex-col items-start">
              <span>
                {selectedCurrency?.symbol} {selectedCurrency?.currencyCode}
              </span>
            </span>
          </Button>
        </DrawerTrigger>
        <DrawerContent className=" flex flex-col max-h-[60vh]">
          <DrawerHeader className="flex flex-row items-center justify-between p-6 pb-4">
            <div className="flex items-center gap-4">
              <DrawerTitle className="text-xl font-semibold">
                Selecciona tu moneda
              </DrawerTitle>
            </div>
          </DrawerHeader>
          <div className="grid flex-grow grid-cols-2 gap-x-4 gap-y-3 overflow-y-auto p-6 pt-2 sm:grid-cols-3 lg:grid-cols-4">
            {countriesCurrency.map((country) => (
              <button
                key={country.countryCode}
                onClick={() => {
                  setCurrencyCode(country.currencyCode);
                  setIsOpen(false);
                }}
                className={cn(
                  "flex items-center justify-between p-2 rounded-lg",
                  {
                    "bg-gray-200 text-[#000]":
                      country.currencyCode === currencyCode,
                  }
                )}
              >
                <div className="flex items-center gap-2">
                  {(() => {
                    if (country.countryCode === "XX") {
                      return (
                        <Globe className="h-4 w-6 text-gray-500 sm:h-6 sm:w-8" />
                      );
                    }
                    const Flag = (
                      Flags as Record<
                        string,
                        React.FC<React.SVGProps<SVGSVGElement>>
                      >
                    )[country.countryCode];
                    return Flag ? (
                      <Flag className="h-4 w-6 rounded-sm sm:h-6 sm:w-8" />
                    ) : (
                      <Globe className="h-4 w-6 sm:h-6 sm:w-8" />
                    );
                  })()}
                  <div className="flex flex-col items-start">
                    <span className="text-left text-sm sm:text-base">
                      {country.currencyName}
                    </span>
                    <span className="text-left text-sm sm:text-base">
                      {country.currencyCode} {country.symbol}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
