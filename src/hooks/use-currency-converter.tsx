import { useGetExchangesQuery } from "@/redux/slices/exchange/exchange-slice";
import { countriesCurrency } from "@/utils/data";
import { useMemo } from "react";
import { useCurrencySelector } from "./use-currency-selector";

export const useCurrency = () => {
  const { currencyCode, changeCurrency } = useCurrencySelector();

  const { data, isLoading, isError } = useGetExchangesQuery("USD");

  const rate = useMemo(() => {
    return data?.conversion_rates?.[currencyCode] ?? 1;
  }, [data, currencyCode]);

  const currencyData = countriesCurrency.find(
    (c) => c.currencyCode === currencyCode
  );
  const symbol = currencyData?.symbol ?? "$";

  const convert = (usdPrice: number) => Number((usdPrice * rate).toFixed(2));

  return {
    convert,
    rate,
    symbol,
    currencyCode,
    setCurrencyCode: changeCurrency,
    currencyName: currencyData?.currencyName ?? "Dólar",
    isLoading,
    isError,
  };
};
