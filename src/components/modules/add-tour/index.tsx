/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ArrowLeft, ShieldCheck, Loader2 } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import { BasicInfoStep } from "./basic-info-step";
import { LocationStep } from "./location-step";
import { DetailsStep } from "./details-step";
import { CategorizationStep } from "./categorization-step";
import { MultimediaStep } from "./multimedia-step";
import type {
  BasicInfoFormValues,
  LocationFormValues,
  DetailsFormValues,
  CategorizationFormValues,
  MultimediaFormValues,
  TourFiles,
  TourData,
} from "./types";

// Importar la mutación de crear producto
import { useCreateProductMutation } from "@/redux/slices/product/product-slice";
import { TourPreview } from "./tour-previuw";

export function TourForm() {
  const [step, setStep] = useState(1);
  const totalSteps = 5;

  // Hook de mutación para crear producto
  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();

  // Estados para almacenar los datos del formulario
  const [basicInfo, setBasicInfo] = useState<BasicInfoFormValues | null>(null);
  const [location, setLocation] = useState<LocationFormValues | null>(null);
  const [details, setDetails] = useState<DetailsFormValues | null>(null);
  const [categorization, setCategorization] =
    useState<CategorizationFormValues | null>(null);
  const [multimedia, setMultimedia] = useState<MultimediaFormValues | null>(
    null
  );
  const [files, setFiles] = useState<TourFiles>({
    bannerFile: null,
    imageFiles: [],
    videoFiles: [],
    fileAttachments: [],
  });
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdTourData, setCreatedTourData] = useState<TourData | null>(null);

  // Función para crear FormData
  const createFormData = (formData: TourData): FormData => {
    const data = new FormData();

    // Datos básicos
    data.append("name", formData.basicInfo.name);
    data.append("description", formData.basicInfo.description);
    data.append("departure_point", formData.basicInfo.departure_point);
    data.append("address", formData.basicInfo.address);
    data.append("country", formData.basicInfo.country);
    if (formData.basicInfo.region) {
      data.append("region", formData.basicInfo.region);
    }
    data.append("max_people", formData.basicInfo.max_people.toString());
    data.append("duration", formData.basicInfo.duration.toString());

    // Ubicación
    data.append("lat", formData.location.lat.toString());
    data.append("long", formData.location.lng.toString());

    // Detalles
    data.append("highlight", formData.details.highlight);
    data.append("included", formData.details.included);
    data.append("difficulty", formData.details.difficulty);

    // Arrays como JSON strings
    data.append(
      "available_dates",
      JSON.stringify(
        formData.details.available_dates.map((date) => date.toISOString())
      )
    );
    data.append("itinerary", JSON.stringify(formData.details.itinerary));
    data.append("expenses", JSON.stringify(formData.details.expenses || []));
    data.append(
      "packing_list",
      JSON.stringify(formData.details.packing_list || [])
    );

    // Categorización
    data.append("product_type_id", formData.categorization.product_type_id);
    data.append(
      "product_category_id",
      formData.categorization.product_category_id
    );
    data.append(
      "target_product_audience_id",
      formData.categorization.target_product_audience_id
    );
    data.append("amenities", JSON.stringify(formData.categorization.amenities));

    // Precio
    data.append("price", formData.multimedia.price.toString());

    // Usuario (esto debería venir del contexto de autenticación)
    data.append("user_id", "user_2xmDPkBuxt6qg1HCSLztz6zvaBx");

    // Archivos
    if (formData.files.bannerFile) {
      data.append("banner", formData.files.bannerFile);
    }

    formData.files.imageFiles.forEach((file, index) => {
      data.append(`images`, file);
    });

    formData.files.videoFiles.forEach((file, index) => {
      data.append(`videos`, file);
    });

    formData.files.fileAttachments.forEach((file, index) => {
      data.append(`attachments`, file);
    });

    return data;
  };

  // Manejadores para cada paso del formulario
  const handleBasicInfoSubmit = (data: BasicInfoFormValues) => {
    setBasicInfo(data);
    setStep(2);
  };

  const handleLocationSubmit = (data: LocationFormValues) => {
    setLocation(data);
    setStep(3);
  };

  const handleDetailsSubmit = (data: DetailsFormValues) => {
    setDetails(data);
    setStep(4);
  };

  const handleCategorizationSubmit = (data: CategorizationFormValues) => {
    setCategorization(data);
    setStep(5);
  };

  const handleMultimediaSubmit = async (
    data: MultimediaFormValues,
    uploadedFiles: TourFiles
  ) => {
    setMultimedia(data);
    setFiles(uploadedFiles);

    // Combinar todos los datos del formulario
    const formData: TourData = {
      basicInfo: basicInfo!,
      location: location!,
      details: details!,
      categorization: categorization!,
      multimedia: data,
      files: uploadedFiles,
    };

    try {
      // Crear FormData para enviar al API
      const apiFormData = createFormData(formData);

      console.log("Enviando datos al API...");

      // Enviar al API usando RTK Query
      const result = await createProduct(apiFormData).unwrap();

      console.log("Tour creado exitosamente:", result);

      // Guardar datos para la vista previa
      setCreatedTourData(formData);
      setIsSuccess(true);

      toast.success("¡Tour creado con éxito!", {
        description: "El tour ha sido registrado correctamente en el sistema.",
      });
    } catch (error) {
      console.error("Error al crear el tour:", error);

      toast.error("Error al crear el tour", {
        description:
          "Hubo un problema al guardar el tour. Por favor, inténtalo de nuevo.",
      });
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleContinue = () => {
    // Disparar el evento submit del formulario actual
    const form = document.querySelector("form");
    if (form) {
      form.dispatchEvent(
        new Event("submit", { cancelable: true, bubbles: true })
      );
    }
  };

  const handleEditTour = () => {
    setIsSuccess(false);
    setStep(1);
  };

  const handleCreateAnother = () => {
    // Resetear todos los estados
    setBasicInfo(null);
    setLocation(null);
    setDetails(null);
    setCategorization(null);
    setMultimedia(null);
    setFiles({
      bannerFile: null,
      imageFiles: [],
      videoFiles: [],
      fileAttachments: [],
    });
    setIsSuccess(false);
    setCreatedTourData(null);
    setStep(1);
  };

  // Mostrar vista previa si el tour fue creado exitosamente
  if (isSuccess && createdTourData) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-green-600 mb-2">
              ¡Tour creado exitosamente!
            </h1>
            <p className="text-gray-600">
              Tu tour ha sido registrado y está listo para ser publicado.
            </p>
          </div>

          <TourPreview onEdit={handleEditTour} tourData={createdTourData} />

          <div className="flex justify-center gap-4">
            <Button variant="outline" onClick={handleEditTour}>
              Editar tour
            </Button>
            <Button onClick={handleCreateAnother}>Crear otro tour</Button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        {/* Progress indicator */}
        <div className="px-6 pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
            <div className="flex items-center">
              {Array.from({ length: totalSteps }).map((_, index) => (
                <div key={index} className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full border ${
                      step >= index + 1
                        ? "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white"
                        : "bg-transparent text-gray-400 border-gray-300 dark:border-gray-700"
                    }`}
                  >
                    <span className="text-xs sm:text-sm">{index + 1}</span>
                  </div>
                  {index < totalSteps - 1 && (
                    <div
                      className={`h-px w-2 sm:w-4 mx-1 ${
                        step > index + 1
                          ? "bg-black dark:bg-white"
                          : "bg-gray-300 dark:bg-gray-700"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{`Paso ${step} de ${totalSteps}`}</div>
          </div>
        </div>

        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-medium">
            {step === 1
              ? "Información básica"
              : step === 2
                ? "Ubicación"
                : step === 3
                  ? "Detalles del tour"
                  : step === 4
                    ? "Categorización"
                    : "Multimedia y precio"}
          </CardTitle>
          <CardDescription>
            {step === 1
              ? "Ingresa la información básica del tour"
              : step === 2
                ? "Selecciona la ubicación exacta en el mapa"
                : step === 3
                  ? "Agrega detalles específicos del tour"
                  : step === 4
                    ? "Categoriza tu tour para mejor visibilidad"
                    : "Agrega imágenes, videos, archivos y establece el precio"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <BasicInfoStep
                  onSubmit={handleBasicInfoSubmit}
                  defaultValues={basicInfo || undefined}
                />
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <LocationStep
                  onSubmit={handleLocationSubmit}
                  defaultValues={location || undefined}
                />
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <DetailsStep
                  onSubmit={handleDetailsSubmit}
                  defaultValues={details || undefined}
                />
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <CategorizationStep
                  onSubmit={handleCategorizationSubmit}
                  defaultValues={categorization || undefined}
                />
              </motion.div>
            )}

            {step === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <MultimediaStep
                  onSubmit={handleMultimediaSubmit}
                  defaultValues={multimedia || undefined}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>

        <CardFooter>
          <div className="flex justify-between w-full">
            {step > 1 ? (
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                className="border-gray-200 dark:border-gray-800 hover:bg-transparent hover:text-black dark:hover:text-white"
                disabled={isCreating}
              >
                <ArrowLeft className="mr-1 sm:mr-2 h-4 w-4" />
                <span className="sm:inline">Atrás</span>
              </Button>
            ) : (
              <div></div>
            )}

            {step < totalSteps ? (
              <Button
                className="bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                onClick={handleContinue}
                disabled={isCreating}
              >
                <span className="flex items-center">
                  <span className="sm:inline">Continuar</span>
                  <ChevronRight className="ml-1 sm:ml-2 h-4 w-4" />
                </span>
              </Button>
            ) : (
              <Button
                className="bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                onClick={handleContinue}
                disabled={isCreating}
              >
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creando tour...
                  </>
                ) : (
                  "Crear tour"
                )}
              </Button>
            )}
          </div>
        </CardFooter>

        {/* Security badge */}
        <div className="flex justify-center pb-4">
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
            <ShieldCheck className="h-3 w-3 mr-1" />
            Información segura
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
