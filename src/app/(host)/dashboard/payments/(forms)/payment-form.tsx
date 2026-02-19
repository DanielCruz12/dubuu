"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";
import {
  useCreatePaymentAccountMutation,
  useUpdatePaymentAccountMutation,
  useGetPaymentAccountByUserIdQuery,
} from "@/redux/slices/payment/payment-account";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StepIndicator } from "../(components)/step-indicator";
import { PaymentMethodSelector } from "../(components)/payment-method-selector";
import { BankForm } from "./bank-form";
import { BlinkForm } from "./blink-form";
import { getPaymentMethodIcon, getPaymentMethodName } from "@/utils";
import type {
  PaymentMethod,
  BankFormValues,
  BlinkFormValues,
  ExistingPaymentData,
} from "@/types/payment-types";
import { ExistingPaymentInfo } from "../(components)/existing-payment-info";
import { PaymentSkeleton } from "@/components/skeletons/payment-account-skeleton";

// Valores por defecto para cuando no hay datos
const emptyBankData: BankFormValues = {
  bankName: "",
  accountType: "",
  accountNumber: "",
  holderName: "",
  email: "",
};

const emptyBlinkData: BlinkFormValues = {
  walletAddress: "",
  email: "",
};

export function PaymentForm() {
  const { user } = useUser();
  const userId = user?.id;

  // Estado para controlar si estamos mostrando datos existentes o el formulario
  const [showExistingData, setShowExistingData] = useState(false);
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(
    "bank"
  ); // Default to bank
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [existingData, setExistingData] = useState<ExistingPaymentData>({
    paymentMethod: "bank",
    bankData: emptyBankData,
    blinkData: emptyBlinkData,
  });
  const [isCurrentlyUpdating, setIsUpdating] = useState(false);
  const [dataFetched, setDataFetched] = useState(false);

  // Consultar datos de pago existentes
  const {
    data: paymentData,
    isLoading: isLoadingPaymentData,
    isSuccess: isSuccessPaymentData,
    error: paymentError,
  } = useGetPaymentAccountByUserIdQuery(userId, {
    skip: !userId,
  });

  // Mutaciones para crear y actualizar
  const [createPaymentAccount, { isLoading: isCreating }] =
    useCreatePaymentAccountMutation();
  const [updatePaymentAccount, { isLoading: isAccountUpdating }] =
    useUpdatePaymentAccountMutation();

  // Cargar datos existentes cuando se obtienen de la API
  useEffect(() => {
    if (isSuccessPaymentData) {
      setDataFetched(true);

      // Verificar si hay datos (array no vacío o objeto válido)
      if (
        paymentData &&
        ((Array.isArray(paymentData) && paymentData.length > 0) ||
          (!Array.isArray(paymentData) && paymentData.id))
      ) {
        // Determinar los datos a usar (primer elemento del array o el objeto directo)
        const accountData = Array.isArray(paymentData)
          ? paymentData[0]
          : paymentData;

        const paymentMethod = (accountData.payment_method || "bank") as PaymentMethod;
        // Mapear los datos de la API al formato que usa nuestro componente
        const mappedData: ExistingPaymentData = {
          paymentMethod,
          bankData: {
            bankName: accountData.bank_name || "",
            accountType: accountData.account_type || "",
            accountNumber: accountData.account_number || "",
            holderName: accountData.holder_name || "",
            email: accountData.email || "",
          },
          blinkData:
            paymentMethod === "blink"
              ? {
                  walletAddress: accountData.blink_wallet_address || "",
                  email: accountData.email || "",
                }
              : emptyBlinkData,
        };

        setExistingData(mappedData);
        setPaymentMethod(mappedData.paymentMethod);
        setPaymentId(accountData.id || null);
        setShowExistingData(true);
      } else {
        // No hay datos, mostrar formulario para crear
        console.log("No se encontraron datos de pago para este usuario");
        setShowExistingData(false);
        setPaymentMethod("bank"); // Default to bank
      }
    } else if (paymentError) {
      // 404 = usuario sin cuenta de pago aún; no es un error de app
      const status = (paymentError as { status?: number })?.status;
      if (status !== 404) {
        console.error("Error al obtener datos de pago:", paymentError);
      }
      setDataFetched(true);
      setShowExistingData(false);
    }
  }, [isSuccessPaymentData, paymentData, paymentError]);

  const handlePaymentMethodSelect = (value: PaymentMethod) => {
    setPaymentMethod(value);
  };

  const handleContinue = () => {
    if (step === 1 && paymentMethod) {
      setStep(2);
    }
  };

  const onBankSubmit = async (data: BankFormValues) => {
    const dataToSend = {
      user_id: userId,
      bank_name: data.bankName,
      account_type: data.accountType,
      account_number: data.accountNumber,
      holder_name: data.holderName,
      email: data.email,
      payment_method: "bank",
    };

    try {
      if (isCurrentlyUpdating && paymentId) {
        const result = await updatePaymentAccount({
          userId,
          paymentId,
          body: dataToSend,
        }).unwrap();
        console.log(result);
        toast.success("Información actualizada con éxito");
      } else {
        const result = await createPaymentAccount(dataToSend).unwrap();
        toast.success("Información enviada con éxito");
        if (result && result.id) setPaymentId(result.id);
      }
      setShowExistingData(true);
      setStep(1);
      setIsUpdating(false);
    } catch (error) {
      console.error("Error al procesar los datos:", error);
      toast.error(
        "Error al procesar la información. Inténtelo de nuevo más tarde."
      );
    }
  };

  const onBlinkSubmit = async (data: BlinkFormValues) => {
    const dataToSend = {
      user_id: userId,
      email: data.email,
      payment_method: "blink",
      blink_wallet_address: data.walletAddress,
    };

    try {
      if (isCurrentlyUpdating && paymentId) {
        await updatePaymentAccount({
          userId,
          paymentId,
          body: dataToSend,
        }).unwrap();
        toast.success("Información actualizada con éxito");
      } else {
        const result = await createPaymentAccount(dataToSend).unwrap();
        toast.success("Información enviada con éxito");
        if (result && result.id) setPaymentId(result.id);
      }
      setExistingData((prev) => ({
        ...prev,
        paymentMethod: "blink",
        blinkData: data,
      }));
      setShowExistingData(true);
      setStep(1);
      setIsUpdating(false);
    } catch (error) {
      console.error("Error al procesar los datos:", error);
      toast.error(
        "Error al procesar la información. Inténtelo de nuevo más tarde."
      );
    }
  };

  const startUpdate = () => {
    setShowExistingData(false);
    setIsUpdating(true);
    setStep(1);
  };

  // Mostrar carga inicial
  if (isLoadingPaymentData && userId && !dataFetched) {
    return <PaymentSkeleton />;
  }

  // Mostrar datos existentes
  if (showExistingData) {
    return <ExistingPaymentInfo data={existingData} onUpdate={startUpdate} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <StepIndicator currentStep={step} totalSteps={2} />

        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-medium">
            {isCurrentlyUpdating
              ? step === 1
                ? "Actualizar método de pago"
                : "Actualizar detalles"
              : step === 1
                ? "Método de pago"
                : "Detalles de pago"}
          </CardTitle>
          <CardDescription>
            {step === 1
              ? isCurrentlyUpdating
                ? "Selecciona cómo quieres recibir tu dinero"
                : "Selecciona cómo quieres recibir tu dinero"
              : `Completa la información para ${getPaymentMethodName(paymentMethod)}`}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <PaymentMethodSelector
                selectedMethod={paymentMethod}
                onMethodSelect={handlePaymentMethodSelect}
              />
            ) : (
              <motion.div
                key="step2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <div className="flex items-center space-x-2 p-2 rounded-md">
                  {getPaymentMethodIcon(paymentMethod)}
                  <span className="text-sm">
                    {getPaymentMethodName(paymentMethod)}
                  </span>
                </div>

                {paymentMethod === "bank" && (
                  <BankForm
                    defaultValues={
                      isCurrentlyUpdating
                        ? existingData.bankData
                        : emptyBankData
                    }
                    onSubmit={onBankSubmit}
                    onBack={() => setStep(1)}
                    isLoading={isCreating || isAccountUpdating}
                    isUpdating={isCurrentlyUpdating}
                  />
                )}
                {paymentMethod === "blink" && (
                  <BlinkForm
                    defaultValues={
                      isCurrentlyUpdating && existingData.blinkData
                        ? existingData.blinkData
                        : emptyBlinkData
                    }
                    onSubmit={onBlinkSubmit}
                    onBack={() => setStep(1)}
                    isLoading={isCreating || isAccountUpdating}
                    isUpdating={isCurrentlyUpdating}
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>

        {step === 1 && (
          <CardFooter>
            <div className="flex justify-end w-full">
              <Button
                className="bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                onClick={handleContinue}
                disabled={!paymentMethod}
              >
                <span className="flex items-center">
                  Continuar
                  <ChevronRight className="ml-2 h-4 w-4" />
                </span>
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>
    </motion.div>
  );
}
