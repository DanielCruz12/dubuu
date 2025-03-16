"use client";

import { RootState, useAppDispatch, useAppSelector } from "@/redux/store";
import { resetFilters, setRating } from "@/redux/slices/filter/filter-slice";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "../ui/button";

const ratingOptions = [
  { label: "5 stars", value: "5" },
  { label: "+4 stars", value: "4" },
  { label: "+3 stars", value: "3" },
];

export default function SearchSection() {
  const dispatch = useAppDispatch();
  const { rating } = useAppSelector((state: RootState) => state.filters);

  return (
    <section className="py-2">
      <div className="flex flex-wrap gap-2">
        <Select
          value={rating}
          onValueChange={(value) => dispatch(setRating(value))}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder={rating || "Rating"} />
          </SelectTrigger>
          <SelectContent>
            {ratingOptions.map(({ label, value }) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button variant="outline" onClick={() => dispatch(resetFilters())}>
          Reset
        </Button>
      </div>
    </section>
  );
}
