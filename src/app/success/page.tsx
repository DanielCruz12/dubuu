"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckIcon } from "lucide-react";
import Confetti from "react-confetti";

export default function SuccessPage() {
  const router = useRouter();
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiRecycle, setConfettiRecycle] = useState(true);

  useEffect(() => {
    // Set dimensions for confetti
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);

    // Wait a shorter time (300ms) before showing confetti
    const startTimer = setTimeout(() => {
      setShowConfetti(true);
    }, 300);

    // After a few seconds, stop recycling confetti so it gradually fades out
    const fadeTimer = setTimeout(() => {
      setConfettiRecycle(false);
    }, 4000);

    return () => {
      window.removeEventListener("resize", updateDimensions);
      clearTimeout(startTimer);
      clearTimeout(fadeTimer);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      {/* Falling confetti with gradual fade-out */}
      {showConfetti && (
        <Confetti
          width={dimensions.width}
          height={dimensions.height}
          recycle={confettiRecycle}
          numberOfPieces={150}
          gravity={0.15}
          confettiSource={{
            x: 0,
            y: 0,
            w: dimensions.width,
            h: 0,
          }}
        />
      )}

      <div className="text-center max-w-md mx-auto z-10 px-6">
        {/* Success checkmark with circle */}
        <div className="relative mx-auto mb-6 w-16 h-16">
          <div className="absolute inset-0 rounded-full bg-green-100"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <CheckIcon className="h-8 w-8 text-green-500" strokeWidth={3} />
          </div>
        </div>

        {/* Text content */}
        <h1 className="text-2xl font-medium text-gray-900 mb-2">
          Gracias por tu reserva
        </h1>
        <p className="text-sm text-gray-500 mb-8">
          Tu reserva ha sido confirmada exitosamente.
        </p>

        {/* Button */}
        <Button
          onClick={() => router.push("/account/bookings")}
          className="bg-green-500 hover:bg-green-600 text-sm px-6 py-2"
        >
          Ver tus reservas
        </Button>
      </div>
    </div>
  );
}
