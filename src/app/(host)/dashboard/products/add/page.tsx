"use client";

import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { AddProductContent } from "./add-product-content";

export default function AddProductPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center gap-2 text-muted-foreground py-12">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      }
    >
      <AddProductContent />
    </Suspense>
  );
}
