import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/redux/store";
import { setCurrencyCode } from "@/redux/slices/exchange/currency-slice";

export const useCurrencySelector = () => {
  const dispatch = useDispatch();
  const currencyCode = useSelector(
    (state: RootState) => state.currency.currencyCode
  );

  const changeCurrency = (code: string) => {
    dispatch(setCurrencyCode(code));
  };

  return { currencyCode, changeCurrency };
};
