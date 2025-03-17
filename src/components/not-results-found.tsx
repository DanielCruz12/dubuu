"use client";
import { FilterX } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { resetFilters } from "@/redux/slices/filter/filter-slice";
import { useAppDispatch } from "@/redux/store";
import Link from "next/link";

export function NoSearchResults() {
  const dispatch = useAppDispatch();
  return (
    <section className="py-6">
      <div className="grid gap-8">
        <div className="p-4">
          <Card className="flex flex-col items-center justify-center h-full min-h-[385px] text-center rounded-3xl border-0 shadow p-8">
            <div className="mb-4 p-4 bg-muted rounded-full">
              <FilterX className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No tours found</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              We couldn&apos;t find any tours matching your current filters. Try
              adjusting your search criteria or browse our complete collection.
            </p>
            <Button
              onClick={() => dispatch(resetFilters())}
              variant="outline"
              className="mb-2"
            >
              <FilterX className="mr-2 h-4 w-4" />
              Reset all filters
            </Button>

            <Link href="/tours" className="text-primary hover:underline mt-2">
              View all available tours
            </Link>
          </Card>
        </div>
      </div>
    </section>
  );
}
