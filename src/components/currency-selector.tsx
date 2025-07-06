"use client";

import type React from "react";

import { useState } from "react";
import { Globe } from "lucide-react";
import * as Flags from "country-flag-icons/react/3x2"; // Importa todos los íconos de banderas

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { countriesCurrency } from "@/utils/data";
import { useGetExchangesQuery } from "@/redux/slices/exchange/exchange-slice";

export default function CountryCurrencySelector() {
  const [selectedCountryCode, setSelectedCountryCode] = useState("SV"); // 'SV' para El Salvador como en la imagen
  const [isOpen, setIsOpen] = useState(false);
  const { data, isLoading } = useGetExchangesQuery("USD");
console.log(data)
  const selectedCurrency = countriesCurrency.find(
    (country) => country.countryCode === selectedCountryCode
  );

  return (
    <div className="flex min-h-[300px] items-center justify-center">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">
            <span className="flex flex-col items-start">
              <span>
                {selectedCurrency?.symbol} {selectedCurrency?.currencyCode}
              </span>
            </span>
          </Button>
        </DialogTrigger>

        <DialogContent className="max-w-4xl p-0 sm:rounded-lg sm:max-h-[90vh] flex flex-col">
          <DialogHeader className="flex flex-row items-center justify-between p-6 pb-4">
            <div className="flex items-center gap-4">
              <DialogTitle className="text-xl font-semibold">
                Selecciona tu moneda
              </DialogTitle>
            </div>
          </DialogHeader>

          <div className="grid flex-grow grid-cols-2 gap-x-4 gap-y-3 overflow-y-auto p-6 pt-2 sm:grid-cols-3 lg:grid-cols-4">
            {countriesCurrency.map((country) => (
              <button
                key={country.countryCode}
                onClick={() => setSelectedCountryCode(country.countryCode)}
                className={cn(
                  "flex items-center justify-between p-2 rounded-lg",
                  {
                    "bg-gray-200 text-[#000]":
                      country.countryCode === selectedCountryCode,
                  }
                )}
              >
                <div className="flex items-center gap-2">
                  {(() => {
                    if (country.countryCode === "XX") {
                      // Caso "Otros países"
                      return <Globe className="h-4 w-6 text-gray-500" />;
                    }

                    const Flag = (
                      Flags as Record<
                        string,
                        React.FC<React.SVGProps<SVGSVGElement>>
                      >
                    )[country.countryCode];

                    return Flag ? (
                      <Flag className="h-4 w-6 rounded-sm" />
                    ) : (
                      <Globe className="h-4 w-6 " />
                    );
                  })()}
                  <div className="flex flex-col items-start">
                    <span className="text-left text-base">
                      {country.currencyName}
                    </span>
                    <span className="text-left text-base">
                      {country.currencyCode} {country.symbol}
                    </span>
                    {!isLoading &&
                      data?.conversion_rates?.[country.currencyCode] && (
                        <span className="text-xs text-left">
                          1 USD ≈{" "}
                          {data.conversion_rates[country.currencyCode].toFixed(
                            2
                          )}{" "}
                          {country.currencyCode}
                        </span>
                      )}
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="flex justify-end p-6 pt-4">
            <Button
              onClick={() => setIsOpen(false)}
              className="rounded-full bg-black px-8 py-2 text-white hover:bg-gray-800"
            >
              Aplicar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
