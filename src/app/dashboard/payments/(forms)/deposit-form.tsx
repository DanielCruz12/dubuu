"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  CreditCard,
  Building,
  ChevronRight,
  ArrowLeft,
  ShieldCheck,
  Landmark,
  Edit,
  User,
  Mail,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Definir tipos de métodos de pago
type PaymentMethod = "bank" | "visa" | "mastercard";

// Datos pre-existentes (simulados)
const existingData = {
  paymentMethod: "bank" as PaymentMethod,
  bankData: {
    bankName: "Bancolombia",
    accountType: "ahorro",
    accountNumber: "123456789",
    holderName: "Juan Pérez",
    email: "juan.perez@ejemplo.com",
  },
  cardData: {
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    holderName: "",
    email: "",
  },
};

// Esquema de validación para transferencia bancaria
const bankSchema = z.object({
  bankName: z.string().min(2, { message: "El nombre del banco es requerido" }),
  accountType: z.string().min(1, { message: "Seleccione un tipo de cuenta" }),
  accountNumber: z
    .string()
    .min(5, { message: "El número de cuenta debe tener al menos 5 caracteres" })
    .regex(/^\d+$/, {
      message: "El número de cuenta debe contener solo números",
    }),
  holderName: z
    .string()
    .min(3, { message: "El nombre del titular es requerido" }),
  email: z.string().email({ message: "Ingrese un correo electrónico válido" }),
});

// Esquema de validación para tarjetas
const cardSchema = z.object({
  cardNumber: z
    .string()
    .min(13, {
      message: "El número de tarjeta debe tener entre 13 y 19 dígitos",
    })
    .max(19, {
      message: "El número de tarjeta debe tener entre 13 y 19 dígitos",
    })
    .regex(/^\d+$/, {
      message: "El número de tarjeta debe contener solo números",
    }),
  expiryDate: z
    .string()
    .regex(/^(0[1-9]|1[0-2])\/([0-9]{2})$/, {
      message: "Formato inválido. Use MM/AA",
    }),
  cvv: z
    .string()
    .min(3, { message: "El CVV debe tener 3 o 4 dígitos" })
    .max(4, { message: "El CVV debe tener 3 o 4 dígitos" })
    .regex(/^\d+$/, { message: "El CVV debe contener solo números" }),
  holderName: z
    .string()
    .min(3, { message: "El nombre del titular es requerido" }),
  email: z.string().email({ message: "Ingrese un correo electrónico válido" }),
});

// Tipos para los formularios
type BankFormValues = z.infer<typeof bankSchema>;
type CardFormValues = z.infer<typeof cardSchema>;

export function PaymentForm() {
  // Estado para controlar si estamos mostrando datos existentes o el formulario
  const [showExistingData, setShowExistingData] = useState(true);
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(
    existingData.paymentMethod
  );
  const [isComplete, setIsComplete] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Formulario para transferencia bancaria
  const bankForm = useForm<BankFormValues>({
    resolver: zodResolver(bankSchema),
    defaultValues: existingData.bankData,
  });

  // Formulario para tarjetas
  const cardForm = useForm<CardFormValues>({
    resolver: zodResolver(cardSchema),
    defaultValues: existingData.cardData,
  });

  const handlePaymentMethodSelect = (value: PaymentMethod) => {
    setPaymentMethod(value);
  };

  const handleContinue = () => {
    if (step === 1 && paymentMethod) {
      setStep(2);
    }
  };

  const onBankSubmit = (data: BankFormValues) => {
    console.log("Datos del formulario bancario:", {
      paymentMethod,
      ...data,
    });
    setIsComplete(true);
  };

  const onCardSubmit = (data: CardFormValues) => {
    console.log("Datos del formulario de tarjeta:", {
      paymentMethod,
      ...data,
    });
    setIsComplete(true);
  };

  const startUpdate = () => {
    setShowExistingData(false);
    setIsUpdating(true);
    setStep(1);
  };

  const getPaymentMethodIcon = (
    method: PaymentMethod | null = paymentMethod
  ) => {
    switch (method) {
      case "bank":
        return <Landmark className="h-5 w-5" />;
      case "visa":
      case "mastercard":
        return <CreditCard className="h-5 w-5" />;
      default:
        return null;
    }
  };

  const getPaymentMethodName = (
    method: PaymentMethod | null = paymentMethod
  ) => {
    switch (method) {
      case "bank":
        return "Transferencia bancaria";
      case "visa":
        return "Visa";
      case "mastercard":
        return "Mastercard";
      default:
        return "";
    }
  };

  // Pantalla de datos existentes
  if (showExistingData) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="border border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="text-xl font-medium">
              Información de pago existente
            </CardTitle>
            <CardDescription>
              Ya tienes un método de pago configurado. Puedes continuar con
              estos datos o actualizarlos.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2 p-3 border border-gray-200 dark:border-gray-800 rounded-md">
              {getPaymentMethodIcon(existingData.paymentMethod)}
              <span className="font-medium">
                {getPaymentMethodName(existingData.paymentMethod)}
              </span>
            </div>

            {existingData.paymentMethod === "bank" && (
              <div className="space-y-3">
                <div className="flex items-start space-x-3 p-3 border border-gray-200 dark:border-gray-800 rounded-md">
                  <Building className="h-5 w-5 mt-0.5" />
                  <div>
                    <p className="font-medium">
                      {existingData.bankData.bankName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {existingData.bankData.accountType === "ahorro"
                        ? "Cuenta de Ahorro"
                        : existingData.bankData.accountType === "corriente"
                          ? "Cuenta Corriente"
                          : "Cuenta de Nómina"}
                    </p>
                    <p className="text-sm text-gray-500">
                      Cuenta: ••••{" "}
                      {existingData.bankData.accountNumber.slice(-4)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 border border-gray-200 dark:border-gray-800 rounded-md">
                  <User className="h-5 w-5 mt-0.5" />
                  <div>
                    <p className="font-medium">
                      {existingData.bankData.holderName}
                    </p>
                    <p className="text-sm text-gray-500">Titular</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 border border-gray-200 dark:border-gray-800 rounded-md">
                  <Mail className="h-5 w-5 mt-0.5" />
                  <div>
                    <p className="font-medium">{existingData.bankData.email}</p>
                    <p className="text-sm text-gray-500">Correo de contacto</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-3">
            <Button
              className="w-full bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
              onClick={() => setIsComplete(true)}
            >
              Continuar con estos datos
            </Button>
            <Button
              variant="outline"
              className="w-full border-gray-200 dark:border-gray-800"
              onClick={startUpdate}
            >
              <Edit className="h-4 w-4 mr-2" />
              Actualizar información
            </Button>
          </CardFooter>

          {/* Security badge */}
          <div className="flex justify-center pb-4">
            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
              <ShieldCheck className="h-3 w-3 mr-1" />
              Conexión segura
            </div>
          </div>
        </Card>
      </motion.div>
    );
  }

  if (isComplete) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="border border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="text-xl font-medium text-center">
              {isUpdating ? "Información actualizada" : "Información recibida"}
            </CardTitle>
            <CardDescription className="text-center">
              {isUpdating
                ? "Hemos actualizado tu información de pago correctamente."
                : "Hemos registrado tu información de pago correctamente."}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 15,
                delay: 0.1,
              }}
              className="rounded-full border border-gray-200 dark:border-gray-800 p-3 mb-4"
            >
              <Check className="h-8 w-8" />
            </motion.div>
            <p className="text-center text-sm text-gray-500 dark:text-gray-400 max-w-xs">
              Los datos han sido {isUpdating ? "actualizados" : "enviados"} y
              mostrados en la consola.
            </p>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
              onClick={() => {
                setStep(1);
                setPaymentMethod(existingData.paymentMethod);
                setShowExistingData(true);
                setIsUpdating(false);
                setIsComplete(false);
                bankForm.reset(existingData.bankData);
                cardForm.reset(existingData.cardData);
              }}
            >
              Volver al inicio
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border border-gray-200 dark:border-gray-800">
        {/* Progress indicator */}
        <div className="px-6 pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div
                className={`flex items-center justify-center w-7 h-7 rounded-full border ${
                  step >= 1
                    ? "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white"
                    : "bg-transparent text-gray-400 border-gray-300 dark:border-gray-700"
                }`}
              >
                1
              </div>
              <div
                className={`h-px w-8 mx-2 ${step > 1 ? "bg-black dark:bg-white" : "bg-gray-300 dark:bg-gray-700"}`}
              />
              <div
                className={`flex items-center justify-center w-7 h-7 rounded-full border ${
                  step >= 2
                    ? "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white"
                    : "bg-transparent text-gray-400 border-gray-300 dark:border-gray-700"
                }`}
              >
                2
              </div>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {step === 1 ? "Paso 1 de 2" : "Paso 2 de 2"}
            </div>
          </div>
        </div>

        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-medium">
            {isUpdating
              ? step === 1
                ? "Actualizar método de pago"
                : "Actualizar detalles"
              : step === 1
                ? "Método de pago"
                : "Detalles de pago"}
          </CardTitle>
          <CardDescription>
            {step === 1
              ? isUpdating
                ? "Selecciona cómo quieres recibir tu dinero"
                : "Selecciona cómo quieres recibir tu dinero"
              : `Completa la información para ${getPaymentMethodName()}`}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="step1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-3"
              >
                <RadioGroup
                  value={paymentMethod || ""}
                  onValueChange={(value: string) =>
                    handlePaymentMethodSelect(value as PaymentMethod)
                  }
                  className="space-y-3"
                >
                  <div
                    className={`border rounded-md p-3 transition-all ${
                      paymentMethod === "bank"
                        ? "border-black dark:border-white"
                        : "border-gray-200 dark:border-gray-800"
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="bank" id="bank" />
                      <Label
                        htmlFor="bank"
                        className="flex items-center cursor-pointer"
                      >
                        <Building className="h-4 w-4 mr-2" />
                        <span>Transferencia bancaria</span>
                      </Label>
                    </div>
                    {paymentMethod === "bank" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-2 pl-6 text-xs text-gray-500 dark:text-gray-400"
                      >
                        <ul className="list-disc pl-4 space-y-1">
                          <li>De 1 a 3 días hábiles</li>
                          <li>Es posible que se te cobre alguna tarifa</li>
                        </ul>
                      </motion.div>
                    )}
                  </div>

                  <div
                    className={`border rounded-md p-3 transition-all ${
                      paymentMethod === "visa"
                        ? "border-black dark:border-white"
                        : "border-gray-200 dark:border-gray-800"
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="visa" id="visa" />
                      <Label
                        htmlFor="visa"
                        className="flex items-center cursor-pointer"
                      >
                        <CreditCard className="h-4 w-4 mr-2" />
                        <span>Visa</span>
                      </Label>
                    </div>
                    {paymentMethod === "visa" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-2 pl-6 text-xs text-gray-500 dark:text-gray-400"
                      >
                        <ul className="list-disc pl-4 space-y-1">
                          <li>Procesamiento inmediato</li>
                          <li>Tarifa de procesamiento del 2.5%</li>
                        </ul>
                      </motion.div>
                    )}
                  </div>

                  <div
                    className={`border rounded-md p-3 transition-all ${
                      paymentMethod === "mastercard"
                        ? "border-black dark:border-white"
                        : "border-gray-200 dark:border-gray-800"
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="mastercard" id="mastercard" />
                      <Label
                        htmlFor="mastercard"
                        className="flex items-center cursor-pointer"
                      >
                        <CreditCard className="h-4 w-4 mr-2" />
                        <span>Mastercard</span>
                      </Label>
                    </div>
                    {paymentMethod === "mastercard" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-2 pl-6 text-xs text-gray-500 dark:text-gray-400"
                      >
                        <ul className="list-disc pl-4 space-y-1">
                          <li>Procesamiento inmediato</li>
                          <li>Tarifa de procesamiento del 2.5%</li>
                        </ul>
                      </motion.div>
                    )}
                  </div>
                </RadioGroup>
              </motion.div>
            ) : (
              <motion.div
                key="step2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <div className="flex items-center space-x-2 p-2 border border-gray-200 dark:border-gray-800 rounded-md">
                  {getPaymentMethodIcon()}
                  <span className="text-sm">{getPaymentMethodName()}</span>
                </div>

                {paymentMethod === "bank" ? (
                  <Form {...bankForm}>
                    <form
                      onSubmit={bankForm.handleSubmit(onBankSubmit)}
                      className="space-y-4"
                    >
                      <FormField
                        control={bankForm.control}
                        name="bankName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nombre del banco</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Ingrese el nombre del banco"
                                className="border-gray-200 dark:border-gray-800 focus:ring-0 focus:border-black dark:focus:border-white"
                              />
                            </FormControl>
                            <FormMessage className="text-xs text-red-500" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={bankForm.control}
                        name="accountType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tipo de cuenta</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="border-gray-200 dark:border-gray-800 focus:ring-0 focus:border-black dark:focus:border-white">
                                  <SelectValue placeholder="Seleccione el tipo de cuenta" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="ahorro">
                                  Cuenta de Ahorro
                                </SelectItem>
                                <SelectItem value="corriente">
                                  Cuenta Corriente
                                </SelectItem>
                                <SelectItem value="nomina">
                                  Cuenta de Nómina
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage className="text-xs text-red-500" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={bankForm.control}
                        name="accountNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Número de cuenta</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Ingrese el número de cuenta"
                                className="border-gray-200 dark:border-gray-800 focus:ring-0 focus:border-black dark:focus:border-white"
                              />
                            </FormControl>
                            <FormMessage className="text-xs text-red-500" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={bankForm.control}
                        name="holderName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nombre completo (titular)</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Ingrese el nombre del titular"
                                className="border-gray-200 dark:border-gray-800 focus:ring-0 focus:border-black dark:focus:border-white"
                              />
                            </FormControl>
                            <FormMessage className="text-xs text-red-500" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={bankForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Correo electrónico</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="email"
                                placeholder="ejemplo@correo.com"
                                className="border-gray-200 dark:border-gray-800 focus:ring-0 focus:border-black dark:focus:border-white"
                              />
                            </FormControl>
                            <FormMessage className="text-xs text-red-500" />
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-between pt-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setStep(1)}
                          className="border-gray-200 dark:border-gray-800 hover:bg-transparent hover:text-black dark:hover:text-white"
                        >
                          <ArrowLeft className="mr-2 h-4 w-4" />
                          Atrás
                        </Button>
                        <Button
                          type="submit"
                          className="bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                        >
                          {isUpdating
                            ? "Actualizar información"
                            : "Enviar información"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                ) : (
                  <Form {...cardForm}>
                    <form
                      onSubmit={cardForm.handleSubmit(onCardSubmit)}
                      className="space-y-4"
                    >
                      <FormField
                        control={cardForm.control}
                        name="cardNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Número de tarjeta</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="XXXX XXXX XXXX XXXX"
                                className="border-gray-200 dark:border-gray-800 focus:ring-0 focus:border-black dark:focus:border-white"
                              />
                            </FormControl>
                            <FormMessage className="text-xs text-red-500" />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={cardForm.control}
                          name="expiryDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Fecha de expiración</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="MM/AA"
                                  className="border-gray-200 dark:border-gray-800 focus:ring-0 focus:border-black dark:focus:border-white"
                                />
                              </FormControl>
                              <FormMessage className="text-xs text-red-500" />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={cardForm.control}
                          name="cvv"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>CVV</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="123"
                                  className="border-gray-200 dark:border-gray-800 focus:ring-0 focus:border-black dark:focus:border-white"
                                />
                              </FormControl>
                              <FormMessage className="text-xs text-red-500" />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={cardForm.control}
                        name="holderName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nombre completo (titular)</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Ingrese el nombre del titular"
                                className="border-gray-200 dark:border-gray-800 focus:ring-0 focus:border-black dark:focus:border-white"
                              />
                            </FormControl>
                            <FormMessage className="text-xs text-red-500" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={cardForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Correo electrónico</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="email"
                                placeholder="ejemplo@correo.com"
                                className="border-gray-200 dark:border-gray-800 focus:ring-0 focus:border-black dark:focus:border-white"
                              />
                            </FormControl>
                            <FormMessage className="text-xs text-red-500" />
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-between pt-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setStep(1)}
                          className="border-gray-200 dark:border-gray-800 hover:bg-transparent hover:text-black dark:hover:text-white px-3 py-1 h-9 text-sm"
                        >
                          <ArrowLeft className="mr-1 h-3.5 w-3.5" />
                          Atrás
                        </Button>
                        <Button
                          type="submit"
                          className="bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 px-3 py-1 h-9 text-sm"
                        >
                          {isUpdating
                            ? "Actualizar información"
                            : "Enviar información"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>

        {step === 1 && (
          <CardFooter>
            <Button
              className="w-full bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
              onClick={handleContinue}
              disabled={!paymentMethod}
            >
              <span className="flex items-center">
                Continuar
                <ChevronRight className="ml-2 h-4 w-4" />
              </span>
            </Button>
          </CardFooter>
        )}

        {/* Security badge */}
        <div className="flex justify-center pb-4">
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
            <ShieldCheck className="h-3 w-3 mr-1" />
            Conexión segura
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
