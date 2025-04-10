"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Review } from "@/types/review";
import StarRating from "./start-rating";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReviewFormProps {
  onSubmitReview: (review: Review) => void;
}

export default function ReviewForm({ onSubmitReview }: ReviewFormProps) {
  const { user } = useUser();
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [charCount, setCharCount] = useState(0);
  const minChars = 100;

  useEffect(() => {
    if (user) {
      setUsername(user.fullName || "");
      setEmail(user.primaryEmailAddress?.emailAddress || "");
    }
  }, [user]);

  useEffect(() => {
    setCharCount(review.trim().length);
  }, [review]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + images.length > 2) {
      alert("Puedes subir un máximo de 2 imágenes.");
      return;
    }
    setImages((prev) => [...prev, ...files]);
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmitReview = () => {
    if (rating === 0 || review.trim().length < minChars) {
      alert(
        `Por favor, proporciona una calificación y una reseña con al menos ${minChars} caracteres.`
      );
      return;
    }

    setIsSubmitting(true);

    const newReview: Review = {
      id: Date.now().toString(),
      username,
      email,
      rating,
      review,
      images, // opcional: depende de cómo maneje las imágenes tu backend
    };

    console.log("Enviando reseña:", newReview);

    onSubmitReview(newReview);

    // Resetear el formulario
    setRating(0);
    setReview("");
    setImages([]);
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-4 pb-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="username">Nombre</Label>
          <Input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Ingresa tu nombre"
            required
            className="bg-background dark:bg-background/80"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Correo electrónico</Label>
          <Input
            id="email"
            type="email"
            value={email}
            disabled
            className="bg-background dark:bg-background/80"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Calificación</Label>
        <div className="w-full flex justify-start">
          <StarRating
            value={rating}
            interactive={true}
            size="large"
            onChange={setRating}
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between">
          <Label htmlFor="review">Reseña</Label>
          <span
            className={cn(
              "text-xs",
              charCount < minChars
                ? "dark:text-red-400 text-destructive"
                : "text-muted-foreground"
            )}
          >
            {charCount}/{minChars} caracteres mínimos
          </span>
        </div>
        <Textarea
          id="review"
          value={review}
          onChange={(e) => setReview(e.target.value)}
          placeholder="Comparte cómo fue tu experiencia..."
          rows={2}
          required
          className="bg-background dark:bg-background/80"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="images">Subir fotos (máximo 2)</Label>
        <Input
          id="images"
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageUpload}
          className="bg-background dark:bg-background/80"
          disabled={images.length >= 2}
        />
        <div className="flex gap-2 mt-2">
          {images.map((img, idx) => (
            <div
              key={idx}
              className="relative w-20 h-20 border rounded overflow-hidden group"
            >
              <Image
                src={URL.createObjectURL(img) || "/placeholder.svg"}
                alt={`vista previa ${idx + 1}`}
                fill
                className="object-cover"
              />
              <button
                type="button"
                onClick={() => removeImage(idx)}
                className="absolute top-0 right-0 bg-black/70 p-1 rounded-bl hidden group-hover:block"
                aria-label="Eliminar imagen"
              >
                <X className="h-3 w-3 text-white" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <Button
        variant="default"
        onClick={handleSubmitReview}
        disabled={
          isSubmitting || rating === 0 || review.trim().length < minChars
        }
        className="w-full"
      >
        {isSubmitting ? "Enviando..." : "Enviar reseña"}
      </Button>
    </div>
  );
}
