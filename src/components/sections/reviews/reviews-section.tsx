/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import ReviewSummary from "./reviews-summary";
import ReviewList from "./review-list";
import { useGetReviewsQuery } from "@/redux/slices/product/review-slice";
import ReviewForm from "./reviews-form";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Info } from "lucide-react";
import { ReusableDialog } from "@/components/reusable-dialog";

export default function ReviewSection({
  productId,
  existingBooking,
}: {
  productId: string;
  existingBooking: any;
}) {
  const { data: reviews = [], isLoading } = useGetReviewsQuery(productId);
  const [openDialogReview, setOpenDialogReview] = useState(false);

  if (isLoading) {
    return <div className="animate-pulse">Loading...</div>;
  }

  const alreadyHadAReview = reviews.some(
    (review) => existingBooking.user_id === review.user_id
  );

  return (
    <div className="mt-12 space-y-8">
      <h2 className="text-xl md:text-2xl font-semibold">Reseñas</h2>
      <ReviewSummary reviews={reviews} />
      <Separator className="dark:border-muted" />
      <ReviewList reviews={reviews} />
      <div>
        <div className="flex items-center mb-2 px-3">
          <h3 className="text-lg md:text-xl font-semibold">Deja una reseña</h3>
          <Popover>
            <PopoverTrigger className="px-2 ml-2 ">
              <Info className="h-4 w-4" />
              <span className="sr-only">Información sobre reseñas</span>
            </PopoverTrigger>
            <PopoverContent className="max-w-xs">
              <p className="text-sm text-muted-foreground">
                Por favor, asegúrate de que tu reseña cumpla con nuestras
                políticas de contenido. No se permiten comentarios ofensivos,
                difamatorios o inapropiados.
              </p>
            </PopoverContent>
          </Popover>
        </div>
        <p className="text-sm text-muted-foreground px-3">
          Tu opinión es importante para nosotros y ayudan a otros viajeros a
          tomar decisiones informadas y mejoran nuestros servicios. Agradecemos
          tu tiempo y comentarios.
        </p>

        <ReusableDialog
          trigger={
            <Button
              disabled={alreadyHadAReview}
              variant="outline"
              className="text-sm mt-2 ml-2"
            >
              {alreadyHadAReview
                ? "¡Gracias por tu reseña!"
                : "Puedes dejar una reseña"}
            </Button>
          }
          title="Escribe tu reseña"
          description="Comparte tu experiencia con otros viajeros"
          className=""
          open={openDialogReview}
          onOpenChange={setOpenDialogReview}
        >
          <ReviewForm
            setOpenDialogReview={setOpenDialogReview}
            productId={productId}
          />
        </ReusableDialog>
      </div>
    </div>
  );
}
