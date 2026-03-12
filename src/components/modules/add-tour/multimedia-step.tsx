"use client";

import type React from "react";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import imageCompression from "browser-image-compression";
import { DollarSign, FileText, Loader2, Upload, Video, X } from "lucide-react";

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
import { scrollToFirstError, validateFiles } from "./utils";
import Image from "next/image";
import { getHostEarningsFromFinalPrice } from "@/lib/price";
// getCommissionRates comentado: solo se usaba para mostrar % en el desglose

// Límites de subida (el usuario no puede subir por encima de esto)
const MAX_BANNER_IMAGE_MB = 5;
const MAX_GALLERY_IMAGE_MB = 5;
const MAX_VIDEO_MB = 50;
const MAX_PDF_MB = 10;

// Compresión: reducir lo máximo posible con un estándar razonable (WebP, máx. 350 KB)
const IMAGE_COMPRESSION_OPTIONS = {
  maxSizeMB: 0.35,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
  fileType: "image/webp" as const,
};

const VIDEO_MAX_DURATION_SECONDS = 30;

function getVideoDurationSeconds(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve(video.duration);
    };
    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("No se pudo leer el video"));
    };
    video.src = url;
  });
}

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
  const [isCompressingBanner, setIsCompressingBanner] = useState(false);
  const [isCompressingImages, setIsCompressingImages] = useState(false);
  const [isCheckingVideos, setIsCheckingVideos] = useState(false);

  const form = useForm<MultimediaFormValues>({
    resolver: zodResolver(multimediaSchema),
    defaultValues: {
      price: defaultValues?.price || undefined,
    },
  });

  // Manejar la carga de archivos (banner e imágenes se comprimen a WebP, máx. 1MB)
  const handleBannerUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    if (file.size > MAX_BANNER_IMAGE_MB * 1024 * 1024) {
      toast.error(`El banner no puede superar ${MAX_BANNER_IMAGE_MB}MB`);
      return;
    }
    setIsCompressingBanner(true);
    try {
      const compressed = await imageCompression(file, IMAGE_COMPRESSION_OPTIONS);
      setBannerFile(compressed);
      const reader = new FileReader();
      reader.onload = () => setBannerPreview(reader.result as string);
      reader.readAsDataURL(compressed);
    } catch (err) {
      console.error(err);
      toast.error("Error al procesar la imagen del banner");
    } finally {
      setIsCompressingBanner(false);
    }
    e.target.value = "";
  };

  const handleImagesUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (!e.target.files?.length) return;
    const selectedFiles = Array.from(e.target.files);
    if (imageFiles.length + selectedFiles.length > 10) {
      toast.error("Máximo 10 imágenes permitidas");
      return;
    }
    const oversized = selectedFiles.filter(
      (f) => f.size > MAX_GALLERY_IMAGE_MB * 1024 * 1024,
    );
    if (oversized.length > 0) {
      toast.error(`Cada imagen puede tener como máximo ${MAX_GALLERY_IMAGE_MB}MB`);
      return;
    }
    setIsCompressingImages(true);
    try {
      const compressed = await Promise.all(
        selectedFiles.map((f) =>
          imageCompression(f, IMAGE_COMPRESSION_OPTIONS),
        ),
      );
      const newFiles = [...imageFiles, ...compressed];
      setImageFiles(newFiles);
      compressed.forEach((file) => {
        const reader = new FileReader();
        reader.onload = () =>
          setImagePreviews((prev) => [...prev, reader.result as string]);
        reader.readAsDataURL(file);
      });
    } catch (err) {
      console.error(err);
      toast.error("Error al comprimir algunas imágenes");
    } finally {
      setIsCompressingImages(false);
    }
    e.target.value = "";
  };

  const handleVideosUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (!e.target.files?.length) return;
    const selectedFiles = Array.from(e.target.files);
    if (videoFiles.length + selectedFiles.length > 5) {
      toast.error("Máximo 5 videos permitidos");
      return;
    }
    const oversized = selectedFiles.filter(
      (f) => f.size > MAX_VIDEO_MB * 1024 * 1024,
    );
    if (oversized.length > 0) {
      toast.error(`Cada video puede tener como máximo ${MAX_VIDEO_MB}MB`);
      return;
    }
    setIsCheckingVideos(true);
    try {
      const valid: File[] = [];
      for (const file of selectedFiles) {
        const duration = await getVideoDurationSeconds(file);
        if (duration > VIDEO_MAX_DURATION_SECONDS) {
          toast.error(
            `"${file.name}" supera los ${VIDEO_MAX_DURATION_SECONDS} segundos (tipo stories). Duración: ${Math.ceil(duration)}s`,
          );
          continue;
        }
        valid.push(file);
      }
      if (valid.length > 0) setVideoFiles((prev) => [...prev, ...valid]);
    } catch {
      toast.error("No se pudo verificar la duración de algún video");
    } finally {
      setIsCheckingVideos(false);
    }
    e.target.value = "";
  };

  const handleFilesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const selectedFiles = Array.from(e.target.files);
    const pdfs = selectedFiles.filter((f) => f.type === "application/pdf");
    const invalid = selectedFiles.filter((f) => f.type !== "application/pdf");
    if (invalid.length > 0) {
      toast.error("Solo se permiten archivos PDF");
      e.target.value = "";
      return;
    }
    if (fileAttachments.length + pdfs.length > 5) {
      toast.error("Máximo 5 archivos permitidos");
      return;
    }
    const oversized = pdfs.filter(
      (f) => f.size > MAX_PDF_MB * 1024 * 1024,
    );
    if (oversized.length > 0) {
      toast.error(`Cada PDF puede tener como máximo ${MAX_PDF_MB}MB`);
      return;
    }
    setFileAttachments((prev) => [...prev, ...pdfs]);
    e.target.value = "";
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
        fileAttachments,
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
    },
  );

  return (
    <Form {...form}>
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-4">
          {/* Banner */}
          <div className="space-y-2">
            <Label htmlFor="banner">Imagen de banner (obligatorio)</Label>
            <div
              className={`relative border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-md p-4 text-center transition-colors ${
                isCompressingBanner
                  ? "cursor-wait bg-gray-50 dark:bg-gray-900/50"
                  : "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900"
              }`}
              onClick={() =>
                !isCompressingBanner &&
                document.getElementById("banner-upload")?.click()
              }
            >
              {isCompressingBanner ? (
                <>
                  <Loader2 className="h-6 w-6 mx-auto mb-2 text-gray-500 animate-spin" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Comprimiendo imagen...
                  </p>
                </>
              ) : (
                <>
                  <Upload className="h-6 w-6 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-500">
                    Haz clic para subir una imagen de banner
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Máx. {MAX_BANNER_IMAGE_MB}MB
                  </p>
                </>
              )}
              <input
                id="banner-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleBannerUpload}
                disabled={isCompressingBanner}
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
              className={`relative border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-md p-4 text-center transition-colors ${
                isCompressingImages
                  ? "cursor-wait bg-gray-50 dark:bg-gray-900/50"
                  : "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900"
              }`}
              onClick={() =>
                !isCompressingImages &&
                imageFiles.length < 10 &&
                document.getElementById("images-upload")?.click()
              }
            >
              {isCompressingImages ? (
                <>
                  <Loader2 className="h-6 w-6 mx-auto mb-2 text-gray-500 animate-spin" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Comprimiendo imágenes...
                  </p>
                </>
              ) : (
                <>
                  <Upload className="h-6 w-6 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-500">
                    Haz clic para subir imágenes
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Máx. {MAX_GALLERY_IMAGE_MB}MB por imagen
                  </p>
                </>
              )}
              <input
                id="images-upload"
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleImagesUpload}
                disabled={imageFiles.length >= 10 || isCompressingImages}
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
              className={`relative border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-md p-4 text-center transition-colors ${
                isCheckingVideos
                  ? "cursor-wait bg-gray-50 dark:bg-gray-900/50"
                  : "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900"
              }`}
              onClick={() =>
                !isCheckingVideos &&
                document.getElementById("videos-upload")?.click()
              }
            >
              {isCheckingVideos ? (
                <>
                  <Loader2 className="h-6 w-6 mx-auto mb-2 text-gray-500 animate-spin" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Comprobando duración...
                  </p>
                </>
              ) : (
                <>
                  <Video className="h-6 w-6 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-500">
                    Haz clic para subir videos
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Máx. {MAX_VIDEO_MB}MB. Duración máx. {VIDEO_MAX_DURATION_SECONDS} s
                  </p>
                </>
              )}
              <input
                id="videos-upload"
                type="file"
                accept="video/*"
                multiple
                className="hidden"
                onChange={handleVideosUpload}
                disabled={isCheckingVideos}
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
                Solo PDF. Máx. {MAX_PDF_MB}MB por archivo
              </p>
              <input
                id="files-upload"
                type="file"
                accept="application/pdf"
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
                    className="border-gray-200 dark:border-gray-800 focus:ring-0 focus:border-black dark:focus:border-white "
                  />
                </FormControl>
                <FormMessage className="text-xs text-red-500" />
              </FormItem>
            )}
          />
          <div className="mb-2" />

          {form.watch("price") > 0 && (
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg py-2 px-4 mb-4">
              <h3 className="text-lg font-medium mb-3 flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                Desglose de precios
              </h3>
              <div className="space-y-2">
                {(() => {
                  const price = Number.parseFloat(
                    form.watch("price").toString(),
                  );
                  const breakdown = getHostEarningsFromFinalPrice(price);
                  // const commissionRates = getCommissionRates(); // solo se usaba para mostrar %; comentado

                  return (
                    <>
                      <div className="flex justify-between items-center text-sm pb-8">
                        <span className="text-gray-600 dark:text-gray-400">
                          Precio final (usuario paga):
                        </span>
                        <span className="font-bold text-2xl">
                          ${price.toFixed(2)}
                        </span>
                      </div>
                      <Separator className="my-2" />
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600 dark:text-gray-400 flex items-center">
                          {/* <Percent className="h-3 w-3 mr-1" /> */}
                          Comisión por pago
                          {/* Porcentaje comentado: ({commissionRates.paymentProcessingPercentage}) */}
                        </span>
                        <span className="font-medium text-red-600">
                          -${breakdown.paymentProcessing.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400  flex items-center">
                          {/*   <Percent className="h-3 w-3 mr-1" /> */}
                          Comisión de plataforma
                          {/* Porcentaje comentado: ({commissionRates.platformPercentage}) */}
                        </span>
                        <span className="font-medium text-red-600">
                          -${breakdown.platformFee.toFixed(2)}
                        </span>
                      </div>
                      <Separator className="my-2" />
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-green-700 dark:text-green-400">
                          Tú recibes:
                        </span>
                        <span className="text-2xl font-bold text-green-700 dark:text-green-400">
                          ${breakdown.hostReceives.toFixed(2)}
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
