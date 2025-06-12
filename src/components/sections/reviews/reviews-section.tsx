"use client";

import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import ReviewSummary from "./reviews-summary";
import ReviewList from "./review-list";
import ReviewForm from "./reviews-form";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Info, CheckCircle, Clock } from "lucide-react";
import { ReusableDialog } from "@/components/reusable-dialog";
import type { Booking } from "@/types/booking";
import type { Review } from "@/types/review";
import { useUser } from "@clerk/nextjs";

interface ReviewSectionProps {
  productId: string;
  existingBooking?: Booking;
  reviews: Review[];
  isLoading: boolean;
}

export default function ReviewSection({
  productId,
  existingBooking,
  reviews,
  isLoading,
}: ReviewSectionProps) {
  const [openDialogReview, setOpenDialogReview] = useState(false);
  const { user, isLoaded: isUserLoaded } = useUser();

  if (isLoading) {
    return <div className="animate-pulse">Cargando...</div>;
  }

  // Determinar el estado del usuario y su reserva
  const userState = {
    isLoggedIn: isUserLoaded && !!user,
    hasBooking: !!existingBooking,
    isBookingCompleted:
      !!existingBooking && existingBooking.status === "completed",
    hasLeftReview:
      !!existingBooking &&
      existingBooking.status === "completed" &&
      reviews.some((review) => existingBooking.user_id === review.user_id),
  };

  return (
    <div className="mt-12 space-y-8">
      {reviews.length < 0 && (
        <h2 className="text-xl md:text-2xl font-semibold">Reseñas</h2>
      )}

      <ReviewSummary reviews={reviews} />
      <Separator className="" />
      <ReviewList reviews={reviews} />

      {/* Sección de interacción del usuario con reseñas - solo mostrar en casos específicos */}
      {renderUserReviewSection(userState)}
    </div>
  );

  // Función para renderizar la sección de reseñas según el estado del usuario
  function renderUserReviewSection(state: {
    isLoggedIn: boolean;
    hasBooking: boolean;
    isBookingCompleted: boolean;
    hasLeftReview: boolean;
  }) {
    // Si el usuario no está logueado o no tiene reserva, no mostrar nada
    if (!state.isLoggedIn || !state.hasBooking) {
      return null;
    }

    // Si el usuario ya dejó una reseña, mostrar mensaje de agradecimiento
    if (state.hasLeftReview) {
      return (
        <div className="mt-6 p-4 border border-green-200 rounded-lg bg-green-50 dark:bg-green-900/10 dark:border-green-800">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            <h3 className="font-medium text-green-800 dark:text-green-400">
              ¡Gracias por tu reseña!
            </h3>
          </div>
          <p className="mt-1 text-sm text-green-700 dark:text-green-300 pl-6">
            Tu opinión es muy valiosa y ayuda a otros viajeros a tomar
            decisiones informadas.
          </p>
        </div>
      );
    }

    // Si el usuario tiene una reserva pero no está completada
    if (!state.isBookingCompleted) {
      return (
        <div className="mt-6 p-4 border rounded-lg">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-medium">Reserva pendiente</h3>
          </div>
          <p className="mt-1 text-sm text-muted-foreground pl-6">
            Podrás dejar una reseña una vez que tu reserva esté completada.
            ¡Esperamos que disfrutes tu experiencia!
          </p>
        </div>
      );
    }

    // Si el usuario tiene una reserva completada y no ha dejado reseña
    if (state.isBookingCompleted) {
      return (
        <div className="mt-6 p-4 border rounded-lg">
          <div className="flex items-center mb-2">
            <h3 className="text-lg md:text-xl font-semibold">
              Deja una reseña
            </h3>
            <Popover>
              <PopoverTrigger className="px-2 ml-2">
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
          <p className="text-sm text-muted-foreground mb-4">
            Tu opinión es importante para nosotros y ayuda a otros viajeros a
            tomar decisiones informadas y mejoran nuestros servicios.
            Agradecemos tu tiempo y comentarios.
          </p>

          <ReusableDialog
            trigger={
              <Button variant="outline" className="text-sm">
                Compartir mi experiencia
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
      );
    }

    // En cualquier otro caso, no mostrar nada
    return null;
  }
}
