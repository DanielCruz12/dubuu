"use client";

import type React from "react";

import { useEffect, useMemo, useState, useRef } from "react";
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
  getMultimediaSchema,
  type TourFiles,
} from "./types";
import { focusFirstStepField, scrollToFirstError, validateFiles } from "./utils";
import Image from "next/image";
import { getHostEarningsFromFinalPrice } from "@/lib/price";
import { useLanguage } from "@/lib/i18n-context";
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

function isRemoteImageSrc(src: string): boolean {
  return /^https?:\/\//i.test(src);
}

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
  /** Edición: permite guardar sin volver a subir banner/galería si ya existen en el producto. */
  isEditMode?: boolean;
  existingMedia?: {
    bannerUrl?: string;
    imageUrls?: string[];
    videoUrls?: string[];
    fileUrls?: string[];
  };
}

export function MultimediaStep({
  onSubmit,
  defaultValues,
  isEditMode = false,
  existingMedia,
}: MultimediaStepProps) {
  const { t } = useLanguage();
  const multimediaSchema = useMemo(() => getMultimediaSchema(t), [t]);

  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(() =>
    existingMedia?.bannerUrl?.trim() ? existingMedia.bannerUrl : null,
  );
  /** En edición: el usuario quitó el banner guardado sin subir otro. */
  const [removedExistingBanner, setRemovedExistingBanner] = useState(false);
  /** URLs de galería ya guardadas; el usuario puede quitar antes de guardar. */
  const [keptExistingImageUrls, setKeptExistingImageUrls] = useState<string[]>(
    () => (existingMedia?.imageUrls ?? []).filter(Boolean),
  );
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

  const totalGalleryCount = keptExistingImageUrls.length + imageFiles.length;

  useEffect(() => {
    if (!existingMedia?.bannerUrl?.trim() || bannerFile || removedExistingBanner) return;
    setBannerPreview(existingMedia.bannerUrl);
  }, [existingMedia?.bannerUrl, bannerFile, removedExistingBanner]);

  useEffect(() => {
    const urls = (existingMedia?.imageUrls ?? []).filter(Boolean);
    if (urls.length === 0) return;
    setKeptExistingImageUrls((prev) => (prev.length === 0 ? urls : prev));
  }, [existingMedia?.imageUrls]);

  useEffect(() => {
    focusFirstStepField(formRef.current, { delayMs: 100 });
  }, [defaultValues?.price, isEditMode]);

  // Manejar la carga de archivos (banner e imágenes se comprimen a WebP, máx. 1MB)
  const handleBannerUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    if (file.size > MAX_BANNER_IMAGE_MB * 1024 * 1024) {
      toast.error(
        t("dashboard.addTour.multimedia.toast.bannerSize").replace(
          "{{max}}",
          String(MAX_BANNER_IMAGE_MB),
        ),
      );
      return;
    }
    setIsCompressingBanner(true);
    try {
      const compressed = await imageCompression(file, IMAGE_COMPRESSION_OPTIONS);
      setBannerFile(compressed);
      setRemovedExistingBanner(false);
      const reader = new FileReader();
      reader.onload = () => setBannerPreview(reader.result as string);
      reader.readAsDataURL(compressed);
    } catch (err) {
      console.error(err);
      toast.error(t("dashboard.addTour.multimedia.toast.processBannerError"));
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
    if (totalGalleryCount + selectedFiles.length > 10) {
      toast.error(t("dashboard.addTour.multimedia.toast.maxImages"));
      return;
    }
    const oversized = selectedFiles.filter(
      (f) => f.size > MAX_GALLERY_IMAGE_MB * 1024 * 1024,
    );
    if (oversized.length > 0) {
      toast.error(
        t("dashboard.addTour.multimedia.toast.imageSize").replace(
          "{{max}}",
          String(MAX_GALLERY_IMAGE_MB),
        ),
      );
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
      toast.error(t("dashboard.addTour.multimedia.toast.compressError"));
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
      toast.error(t("dashboard.addTour.multimedia.toast.maxVideos"));
      return;
    }
    const oversized = selectedFiles.filter(
      (f) => f.size > MAX_VIDEO_MB * 1024 * 1024,
    );
    if (oversized.length > 0) {
      toast.error(
        t("dashboard.addTour.multimedia.toast.videoSize").replace(
          "{{max}}",
          String(MAX_VIDEO_MB),
        ),
      );
      return;
    }
    setIsCheckingVideos(true);
    try {
      const valid: File[] = [];
      for (const file of selectedFiles) {
        const duration = await getVideoDurationSeconds(file);
        if (duration > VIDEO_MAX_DURATION_SECONDS) {
          toast.error(
            t("dashboard.addTour.multimedia.toast.videoDuration")
              .replace("{{name}}", file.name)
              .replace("{{seconds}}", String(VIDEO_MAX_DURATION_SECONDS))
              .replace("{{duration}}", String(Math.ceil(duration))),
          );
          continue;
        }
        valid.push(file);
      }
      if (valid.length > 0) setVideoFiles((prev) => [...prev, ...valid]);
    } catch {
      toast.error(t("dashboard.addTour.multimedia.toast.verifyDurationError"));
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
      toast.error(t("dashboard.addTour.multimedia.toast.pdfOnly"));
      e.target.value = "";
      return;
    }
    if (fileAttachments.length + pdfs.length > 5) {
      toast.error(t("dashboard.addTour.multimedia.toast.maxFiles"));
      return;
    }
    const oversized = pdfs.filter(
      (f) => f.size > MAX_PDF_MB * 1024 * 1024,
    );
    if (oversized.length > 0) {
      toast.error(
        t("dashboard.addTour.multimedia.toast.pdfSize").replace(
          "{{max}}",
          String(MAX_PDF_MB),
        ),
      );
      return;
    }
    setFileAttachments((prev) => [...prev, ...pdfs]);
    e.target.value = "";
  };

  const handleRemoveBanner = () => {
    if (bannerFile) {
      setBannerFile(null);
      if (existingMedia?.bannerUrl?.trim()) {
        setBannerPreview(existingMedia.bannerUrl);
        setRemovedExistingBanner(false);
      } else {
        setBannerPreview(null);
      }
    } else {
      setRemovedExistingBanner(true);
      setBannerPreview(null);
    }
  };

  const removeExistingImageAt = (index: number) => {
    setKeptExistingImageUrls((prev) => prev.filter((_, i) => i !== index));
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
      const fileErrors = validateFiles(
        t,
        bannerFile,
        imageFiles,
        videoFiles,
        fileAttachments,
        isEditMode
          ? {
              existingBannerUrl:
                existingMedia?.bannerUrl?.trim() && !removedExistingBanner
                  ? existingMedia.bannerUrl
                  : undefined,
              existingImageCount: keptExistingImageUrls.length,
            }
          : undefined,
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
      <form ref={formRef} className="space-y-6" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <Label htmlFor="banner">{t("dashboard.addTour.multimedia.bannerLabel")}</Label>
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
                    {t("dashboard.addTour.multimedia.compressingImage")}
                  </p>
                </>
              ) : (
                <>
                  <Upload className="h-6 w-6 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-500">
                    {t("dashboard.addTour.multimedia.bannerClick")}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {t("dashboard.addTour.multimedia.bannerMax").replace("{{max}}", String(MAX_BANNER_IMAGE_MB))}
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
                    unoptimized={isRemoteImageSrc(bannerPreview)}
                  />
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={handleRemoveBanner}
                  className="absolute top-2 right-2 h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">{t("dashboard.addTour.multimedia.delete")}</span>
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="images">
                {t("dashboard.addTour.multimedia.imagesLabel")}
              </Label>
              <span className="text-xs text-gray-500">
                {t("dashboard.addTour.multimedia.imagesCount").replace("{{count}}", String(totalGalleryCount))}
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
                totalGalleryCount < 10 &&
                document.getElementById("images-upload")?.click()
              }
            >
              {isCompressingImages ? (
                <>
                  <Loader2 className="h-6 w-6 mx-auto mb-2 text-gray-500 animate-spin" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t("dashboard.addTour.multimedia.compressingImages")}
                  </p>
                </>
              ) : (
                <>
                  <Upload className="h-6 w-6 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-500">
                    {t("dashboard.addTour.multimedia.imagesClick")}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {t("dashboard.addTour.multimedia.imagesMaxPer").replace("{{max}}", String(MAX_GALLERY_IMAGE_MB))}
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
                disabled={totalGalleryCount >= 10 || isCompressingImages}
              />
            </div>
            {(keptExistingImageUrls.length > 0 || imagePreviews.length > 0) && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 mt-2">
                {keptExistingImageUrls.map((url, index) => (
                  <div key={`existing-${url}-${index}`} className="relative group">
                    <div className="aspect-video rounded-md overflow-hidden">
                      <Image
                        src={url || "/tour1.jpg"}
                        alt={`Tour image ${index + 1}`}
                        className="w-full h-full object-cover"
                        width={1000}
                        height={1000}
                        unoptimized={isRemoteImageSrc(url)}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => removeExistingImageAt(index)}
                      className="absolute top-1 right-1 h-6 w-6 p-0 opacity-70 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                      <span className="sr-only">{t("dashboard.addTour.multimedia.delete")}</span>
                    </Button>
                  </div>
                ))}
                {imagePreviews.map((preview, index) => (
                  <div key={`new-${index}`} className="relative group">
                    <div className="aspect-video rounded-md overflow-hidden">
                      <Image
                        src={preview || "/tour1.jpg"}
                        alt={`Tour image ${keptExistingImageUrls.length + index + 1}`}
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
                      <span className="sr-only">{t("dashboard.addTour.multimedia.delete")}</span>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="videos">{t("dashboard.addTour.multimedia.videosLabel")}</Label>
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
                    {t("dashboard.addTour.multimedia.checkingDuration")}
                  </p>
                </>
              ) : (
                <>
                  <Video className="h-6 w-6 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-500">
                    {t("dashboard.addTour.multimedia.videosClick")}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {t("dashboard.addTour.multimedia.videosMax")
                      .replace("{{max}}", String(MAX_VIDEO_MB))
                      .replace("{{seconds}}", String(VIDEO_MAX_DURATION_SECONDS))}
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
            {isEditMode &&
              existingMedia?.videoUrls &&
              existingMedia.videoUrls.filter(Boolean).length > 0 && (
                <div className="space-y-2">
                  {existingMedia.videoUrls.filter(Boolean).map((url, index) => (
                    <video
                      key={`existing-video-${url}-${index}`}
                      src={url}
                      controls
                      className="w-full max-h-48 rounded-md border border-gray-200 dark:border-gray-800 bg-black/5"
                      preload="metadata"
                    />
                  ))}
                </div>
              )}
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
                      <span className="sr-only">{t("dashboard.addTour.multimedia.delete")}</span>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="files">
              {t("dashboard.addTour.multimedia.filesLabel")}
            </Label>
            <div
              className="border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-md p-4 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
              onClick={() => document.getElementById("files-upload")?.click()}
            >
              <FileText className="h-6 w-6 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-500">
                {t("dashboard.addTour.multimedia.filesClick")}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {t("dashboard.addTour.multimedia.filesPdfMax").replace("{{max}}", String(MAX_PDF_MB))}
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
            {isEditMode &&
              existingMedia?.fileUrls &&
              existingMedia.fileUrls.filter(Boolean).length > 0 && (
                <div className="space-y-2">
                  {existingMedia.fileUrls.filter(Boolean).map((url, index) => (
                    <a
                      key={`existing-file-${url}-${index}`}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2 border rounded-md border-gray-200 dark:border-gray-800 text-sm text-primary hover:underline truncate"
                    >
                      <FileText className="h-4 w-4 shrink-0" />
                      <span className="truncate">{url.split("/").pop() || url}</span>
                    </a>
                  ))}
                </div>
              )}
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
                      <span className="sr-only">{t("dashboard.addTour.multimedia.delete")}</span>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Separator className="my-4" />

          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("dashboard.addTour.multimedia.priceLabel")}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    step="0.01"
                    placeholder={t("dashboard.addTour.multimedia.pricePlaceholder")}
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
                {t("dashboard.addTour.multimedia.priceBreakdown")}
              </h3>
              <div className="space-y-2">
                {(() => {
                  const price = Number.parseFloat(
                    form.watch("price").toString(),
                  );
                  const breakdown = getHostEarningsFromFinalPrice(price);

                  return (
                    <>
                      <div className="flex justify-between items-center text-sm pb-8">
                        <span className="text-gray-600 dark:text-gray-400">
                          {t("dashboard.addTour.multimedia.finalPrice")}
                        </span>
                        <span className="font-bold text-2xl">
                          ${price.toFixed(2)}
                        </span>
                      </div>
                      <Separator className="my-2" />
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600 dark:text-gray-400 flex items-center">
                          {t("dashboard.addTour.multimedia.paymentCommission")}
                        </span>
                        <span className="font-medium text-red-600">
                          -${breakdown.paymentProcessing.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400  flex items-center">
                          {t("dashboard.addTour.multimedia.platformCommission")}
                        </span>
                        <span className="font-medium text-red-600">
                          -${breakdown.platformFee.toFixed(2)}
                        </span>
                      </div>
                      <Separator className="my-2" />
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-green-700 dark:text-green-400">
                          {t("dashboard.addTour.multimedia.youReceive")}
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
