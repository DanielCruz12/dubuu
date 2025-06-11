"use client";

import type React from "react";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DollarSign, FileText, Percent, Upload, Video, X } from "lucide-react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

import {
  type MultimediaFormValues,
  multimediaSchema,
  type TourFiles,
} from "./types";
import { calculatePrices, scrollToFirstError, validateFiles } from "./utils";
import Image from "next/image";

interface MultimediaStepProps {
  onSubmit: (data: MultimediaFormValues, files: TourFiles) => void;
  defaultValues?: Partial<MultimediaFormValues>;
}

export function MultimediaStep({
  onSubmit,
  defaultValues,
}: MultimediaStepProps) {
  // Estados para archivos
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [videoFiles, setVideoFiles] = useState<File[]>([]);
  const [fileAttachments, setFileAttachments] = useState<File[]>([]);

  const form = useForm<MultimediaFormValues>({
    resolver: zodResolver(multimediaSchema),
    defaultValues: {
      price: defaultValues?.price || undefined,
    },
  });

  // Manejar la carga de archivos
  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Validar tamaño
      if (file.size > 5 * 1024 * 1024) {
        toast.error("El archivo excede el tamaño máximo de 5MB");
        return;
      }

      setBannerFile(file);

      const reader = new FileReader();
      reader.onload = () => {
        setBannerPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImagesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);

      // Validar número máximo
      if (imageFiles.length + selectedFiles.length > 10) {
        toast.error("Máximo 10 imágenes permitidas");
        return;
      }

      // Validar tamaño
      const oversizedFiles = selectedFiles.filter(
        (file) => file.size > 5 * 1024 * 1024
      );
      if (oversizedFiles.length > 0) {
        toast.error("Algunas imágenes exceden el tamaño máximo de 5MB");
        return;
      }

      const newFiles = [...imageFiles, ...selectedFiles];
      setImageFiles(newFiles);

      // Crear previsualizaciones
      selectedFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onload = () => {
          setImagePreviews((prev) => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleVideosUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);

      // Validar número máximo
      if (videoFiles.length + selectedFiles.length > 5) {
        toast.error("Máximo 5 videos permitidos");
        return;
      }

      // Validar tamaño
      const oversizedFiles = selectedFiles.filter(
        (file) => file.size > 50 * 1024 * 1024
      );
      if (oversizedFiles.length > 0) {
        toast.error("Algunos videos exceden el tamaño máximo de 50MB");
        return;
      }

      const newFiles = [...videoFiles, ...selectedFiles];
      setVideoFiles(newFiles);
    }
  };

  const handleFilesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);

      // Validar número máximo
      if (fileAttachments.length + selectedFiles.length > 5) {
        toast.error("Máximo 5 archivos permitidos");
        return;
      }

      // Validar tamaño
      const oversizedFiles = selectedFiles.filter(
        (file) => file.size > 10 * 1024 * 1024
      );
      if (oversizedFiles.length > 0) {
        toast.error("Algunos archivos exceden el tamaño máximo de 10MB");
        return;
      }

      const newFiles = [...fileAttachments, ...selectedFiles];
      setFileAttachments(newFiles);
    }
  };

  const removeImage = (index: number) => {
    const newFiles = imageFiles.filter((_, i) => i !== index);
    setImageFiles(newFiles);
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const removeVideo = (index: number) => {
    const newFiles = videoFiles.filter((_, i) => i !== index);
    setVideoFiles(newFiles);
  };

  const removeFile = (index: number) => {
    const newFiles = fileAttachments.filter((_, i) => i !== index);
    setFileAttachments(newFiles);
  };

  const handleSubmit = form.handleSubmit(
    (data) => {
      // Validar archivos
      const fileErrors = validateFiles(
        bannerFile,
        imageFiles,
        videoFiles,
        fileAttachments
      );

      if (fileErrors.length > 0) {
        fileErrors.forEach((error) => {
          toast.error(error);
        });
        return;
      }

      onSubmit(data, {
        bannerFile,
        imageFiles,
        videoFiles,
        fileAttachments,
      });
    },
    (errors) => {
      // Hacer scroll al primer error
      scrollToFirstError(errors);
    }
  );

  return (
    <Form {...form}>
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-4">
          {/* Banner */}
          <div className="space-y-2">
            <Label htmlFor="banner">Imagen de banner (obligatorio)</Label>
            <div
              className="border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-md p-4 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
              onClick={() => document.getElementById("banner-upload")?.click()}
            >
              <Upload className="h-6 w-6 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-500">
                Haz clic para subir una imagen de banner
              </p>
              <p className="text-xs text-gray-400 mt-1">
                PNG, JPG o WEBP (máx. 5MB)
              </p>
              <input
                id="banner-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleBannerUpload}
              />
            </div>
            {bannerPreview && (
              <div className="relative">
                <div className="aspect-[3/1] rounded-md overflow-hidden">
                  <Image
                    src={bannerPreview || "/tour1.jpg"}
                    alt="Banner preview"
                    className="w-full h-full object-cover"
                    width={1000}
                    height={1000}
                  />
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={() => {
                    setBannerFile(null);
                    setBannerPreview(null);
                  }}
                  className="absolute top-2 right-2 h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">Eliminar</span>
                </Button>
              </div>
            )}
          </div>

          {/* Imágenes */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="images">
                Imágenes del tour (obligatorio, mín. 5, máx. 10)
              </Label>
              <span className="text-xs text-gray-500">
                {imageFiles.length}/10
              </span>
            </div>

            <div
              className="border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-md p-4 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
              onClick={() => document.getElementById("images-upload")?.click()}
            >
              <Upload className="h-6 w-6 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-500">
                Haz clic para subir imágenes
              </p>
              <p className="text-xs text-gray-400 mt-1">
                PNG, JPG o WEBP (máx. 5MB cada una)
              </p>
              <input
                id="images-upload"
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleImagesUpload}
                disabled={imageFiles.length >= 10}
              />
            </div>
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 mt-2">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-video rounded-md overflow-hidden">
                      <Image
                        src={preview || "/tour1.jpg"}
                        alt={`Tour image ${index + 1}`}
                        className="w-full h-full object-cover"
                        width={1000}
                        height={1000}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 h-6 w-6 p-0 opacity-70 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                      <span className="sr-only">Eliminar</span>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Videos */}
          <div className="space-y-2">
            <Label htmlFor="videos">Videos (opcional, máx. 5)</Label>
            <div
              className="border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-md p-4 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
              onClick={() => document.getElementById("videos-upload")?.click()}
            >
              <Video className="h-6 w-6 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-500">
                Haz clic para subir videos
              </p>
              <p className="text-xs text-gray-400 mt-1">
                MP4, WEBM o MOV (máx. 50MB cada uno)
              </p>
              <input
                id="videos-upload"
                type="file"
                accept="video/*"
                multiple
                className="hidden"
                onChange={handleVideosUpload}
              />
            </div>
            {videoFiles.length > 0 && (
              <div className="space-y-2">
                {videoFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 border rounded-md border-gray-200 dark:border-gray-800"
                  >
                    <div className="flex items-center">
                      <Video className="h-4 w-4 mr-2" />
                      <span className="text-sm truncate max-w-[200px]">
                        {file.name}
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => removeVideo(index)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-3 w-3" />
                      <span className="sr-only">Eliminar</span>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Archivos */}
          <div className="space-y-2">
            <Label htmlFor="files">
              Archivos adicionales (opcional, máx. 5)
            </Label>
            <div
              className="border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-md p-4 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
              onClick={() => document.getElementById("files-upload")?.click()}
            >
              <FileText className="h-6 w-6 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-500">
                Haz clic para subir archivos
              </p>
              <p className="text-xs text-gray-400 mt-1">
                PDF, DOC, DOCX, etc. (máx. 10MB cada uno)
              </p>
              <input
                id="files-upload"
                type="file"
                multiple
                className="hidden"
                onChange={handleFilesUpload}
              />
            </div>
            {fileAttachments.length > 0 && (
              <div className="space-y-2">
                {fileAttachments.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 border rounded-md border-gray-200 dark:border-gray-800"
                  >
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 mr-2" />
                      <span className="text-sm truncate max-w-[200px]">
                        {file.name}
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => removeFile(index)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-3 w-3" />
                      <span className="sr-only">Eliminar</span>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Separator className="my-4" />

          {/* Precio */}
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Precio por persona ($)</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    step="0.01"
                    placeholder="Ej. 20.99"
                    className="border-gray-200 dark:border-gray-800 focus:ring-0 focus:border-black dark:focus:border-white"
                  />
                </FormControl>
                <FormMessage className="text-xs text-red-500" />
              </FormItem>
            )}
          />

          {/* Cálculo de precios */}
          {form.watch("price") > 0 && (
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mt-2">
              <h3 className="text-lg font-medium mb-3 flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                Desglose de precios
              </h3>
              <div className="space-y-2">
                {(() => {
                  const price = Number.parseFloat(
                    form.watch("price").toString()
                  );
                  const { tourismTax, platformFee, sellerEarns, userPays } =
                    calculatePrices(price);

                  return (
                    <>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600 dark:text-gray-400">
                          Precio base:
                        </span>
                        <span className="font-medium">${price.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600 dark:text-gray-400 flex items-center">
                          <Percent className="h-3 w-3 mr-1" />
                          Impuesto de turismo (5%):
                        </span>
                        <span className="font-medium">
                          -${tourismTax.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600 dark:text-gray-400 flex items-center">
                          <Percent className="h-3 w-3 mr-1" />
                          Comisión de plataforma (10%):
                        </span>
                        <span className="font-medium">
                          -${platformFee.toFixed(2)}
                        </span>
                      </div>
                      <Separator className="my-2" />
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Tú recibes:</span>
                        <span className="font-bold text-lg">
                          ${sellerEarns.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mt-4 pt-2 border-t">
                        <span className="font-medium">El usuario paga:</span>
                        <span className="font-bold text-lg">
                          ${userPays.toFixed(2)}
                        </span>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          )}
        </div>
      </form>
    </Form>
  );
}
