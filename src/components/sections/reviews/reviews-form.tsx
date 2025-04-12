"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import StarRating from "./start-rating";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { Review } from "@/types/review";
import { useCreateReviewMutation } from "@/redux/slices/product/review-slice";

// Define the form schema with Zod
const reviewFormSchema = z.object({
  username: z.string().min(2, { message: "El nombre es requerido" }),
  email: z.string().email({ message: "Correo electrónico inválido" }),
  rating: z.number().min(1, { message: "La calificación es requerida" }),
  review: z
    .string()
    .min(100, { message: "La reseña debe tener al menos 100 caracteres" })
    .max(1000, { message: "La reseña no puede exceder 1000 caracteres" }),
});

type ReviewFormValues = z.infer<typeof reviewFormSchema>;

interface ReviewFormProps {
  productId: string;
  setOpenDialogReview: (open: boolean) => void;
}

export default function ReviewForm({
  productId,
  setOpenDialogReview,
}: ReviewFormProps) {
  const { user } = useUser();
  const [images, setImages] = useState<File[]>([]);
  const [createReview, { isLoading }] = useCreateReviewMutation();

  // Initialize the form with React Hook Form
  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      username: "",
      email: "",
      rating: 0,
      review: "",
    },
  });

  // Populate form with user data when available
  useEffect(() => {
    if (user) {
      form.setValue("username", user.fullName || "");
      form.setValue("email", user.primaryEmailAddress?.emailAddress || "");
    }
  }, [user, form]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + images.length > 2) {
      toast.warning("Puedes subir un máximo de 2 imágenes.");
      return;
    }
    setImages((prev) => [...prev, ...files]);
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: ReviewFormValues) => {
    try {
      // Convert images to base64 or handle them according to your API requirements
      // This is a simplified example - in production you might use FormData or a dedicated upload service
      const imagePromises = images.map((file) => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve(reader.result as string);
          };
          reader.readAsDataURL(file);
        });
      });

      const imageUrls = await Promise.all(imagePromises);
      console.log(imageUrls);

      const reviewData: Omit<Review, "id"> = {
        product_id: productId,
        user_id: user?.id || "",
        username: data.username,
        email: data.email,
        rating: data.rating,
        review: data.review,
      };

      await createReview(reviewData).unwrap();
      setOpenDialogReview(false);
      form.reset();
      setImages([]);
      toast.success("¡Gracias por tu reseña!");
    } catch (error) {
      toast.error("Error al enviar la reseña. Por favor, intenta de nuevo.");
      console.error("Error submitting review:", error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pb-3">
        <FormField
          control={form.control}
          name="rating"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Calificación</FormLabel>
              <FormControl>
                <div className="w-full flex justify-start">
                  <StarRating
                    value={field.value}
                    interactive={true}
                    size="large"
                    onChange={(value) => field.onChange(value)}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="review"
          render={({ field }) => (
            <FormItem>
              <div className="flex justify-between">
                <FormLabel>Reseña</FormLabel>
                <span
                  className={cn(
                    "text-xs",
                    field.value.length < 100
                      ? "dark:text-red-400 text-destructive"
                      : "text-muted-foreground"
                  )}
                >
                  {field.value.length}/100 caracteres mínimos
                </span>
              </div>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Comparte cómo fue tu experiencia..."
                  rows={4}
                  className="bg-background dark:bg-background/80"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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

        <div className="flex justify-end">
          <Button
            type="submit"
            variant="default"
            disabled={isLoading}
            className=""
          >
            {isLoading ? "Enviando..." : "Enviar reseña"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
