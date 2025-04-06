"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { CreditCard, Info } from "lucide-react";
import Image from "next/image";

const formSchema = z.object({
  firstName: z
    .string()
    .min(2, { message: "El nombre debe tener al menos 2 caracteres." }),
  lastName: z
    .string()
    .min(2, { message: "El apellido debe tener al menos 2 caracteres." }),
  email: z
    .string()
    .email({ message: "Por favor ingresa un correo electrónico válido." }),
  phone: z
    .string()
    .min(8, { message: "Por favor ingresa un número de teléfono válido." })
    .regex(/^[0-9+\s()-]+$/, { message: "Formato de teléfono inválido." }),
  address: z
    .string()
    .min(5, { message: "La dirección debe tener al menos 5 caracteres." }),
  city: z
    .string()
    .min(2, { message: "La ciudad debe tener al menos 2 caracteres." })
    .optional(),
  state: z.string().min(2, { message: "Por favor selecciona una región." }),
  zipCode: z.string().optional(),
  country: z.string().min(2, { message: "Por favor selecciona un país." }),
  paymentMethod: z.enum(["credit", "paypal", "wompi", "googlepay"]),
  cardNumber: z
    .string()
    .optional()
    .refine((val) => !val || /^[0-9]{16}$/.test(val?.replace(/\s/g, "")), {
      message: "Número de tarjeta inválido.",
    }),
  cardName: z
    .string()
    .optional()
    .refine((val) => !val || val.trim().length > 3, {
      message:
        "Por favor ingresa el nombre completo como aparece en la tarjeta.",
    }),
  cardExpiry: z
    .string()
    .optional()
    .refine((val) => !val || /^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(val), {
      message: "Formato de fecha inválido (MM/YY).",
    }),
  cardCvc: z
    .string()
    .optional()
    .refine((val) => !val || /^[0-9]{3,4}$/.test(val), {
      message: "CVC inválido.",
    }),
});

// Definir todas las regiones
const elSalvadorRegions = [
  { id: "SV-AH", nombre: "Ahuachapan", codigoPostal: "2101" },
  { id: "SV-CA", nombre: "Cabanas", codigoPostal: "1201" },
  { id: "SV-CH", nombre: "Chalatenango", codigoPostal: "1301" },
  { id: "SV-CU", nombre: "Cuscatlan", codigoPostal: "1401" },
  { id: "SV-LI", nombre: "La Libertad", codigoPostal: "1501" },
  { id: "SV-MO", nombre: "Morazan", codigoPostal: "3201" },
  { id: "SV-PA", nombre: "La Paz", codigoPostal: "1601" },
  { id: "SV-SA", nombre: "Santa Ana", codigoPostal: "2201" },
  { id: "SV-SM", nombre: "San Miguel", codigoPostal: "3301" },
  { id: "SV-SO", nombre: "Sonsonate", codigoPostal: "2301" },
  { id: "SV-SS", nombre: "San Salvador", codigoPostal: "1101" },
  { id: "SV-SV", nombre: "San Vicente", codigoPostal: "1701" },
  { id: "SV-UN", nombre: "La Union", codigoPostal: "3101" },
  { id: "SV-US", nombre: "Usulutan", codigoPostal: "3401" },
];

const guatemalaRegions = [
  { id: "GT-AV", nombre: "Alta Verapaz", codigoPostal: null },
  { id: "GT-BV", nombre: "Baja Verapaz", codigoPostal: null },
  { id: "GT-CM", nombre: "Chimaltenango", codigoPostal: null },
  { id: "GT-CQ", nombre: "Chiquimula", codigoPostal: null },
  { id: "GT-ES", nombre: "Escuintla", codigoPostal: null },
  { id: "GT-GU", nombre: "Guatemala", codigoPostal: null },
  { id: "GT-HU", nombre: "Huehuetenango", codigoPostal: null },
  { id: "GT-IZ", nombre: "Izabal", codigoPostal: null },
  { id: "GT-JA", nombre: "Jalapa", codigoPostal: null },
  { id: "GT-JU", nombre: "Jutiapa", codigoPostal: null },
  { id: "GT-PE", nombre: "Peten", codigoPostal: null },
  { id: "GT-PR", nombre: "El Progreso", codigoPostal: null },
  { id: "GT-QC", nombre: "Quiche", codigoPostal: null },
  { id: "GT-QZ", nombre: "Quetzaltenango", codigoPostal: null },
  { id: "GT-RE", nombre: "Retalhuleu", codigoPostal: null },
  { id: "GT-SA", nombre: "Sacatepequez", codigoPostal: null },
  { id: "GT-SM", nombre: "San Marcos", codigoPostal: null },
  { id: "GT-SO", nombre: "Solola", codigoPostal: null },
  { id: "GT-SR", nombre: "Santa Rosa", codigoPostal: null },
  { id: "GT-SU", nombre: "Suchitepequez", codigoPostal: null },
  { id: "GT-TO", nombre: "Totonicapan", codigoPostal: null },
  { id: "GT-ZA", nombre: "Zacapa", codigoPostal: null },
];

export default function CheckoutForm() {
  const router = useRouter();
  const [paymentTab, setPaymentTab] = useState("credit");
  const [selectedCountry, setSelectedCountry] = useState("SV");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      country: "SV",
      paymentMethod: "credit",
    },
  });

  // Update regions when country changes
  useEffect(() => {
    const country = form.watch("country");
    setSelectedCountry(country);
    form.setValue("state", "");
    form.setValue("zipCode", "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.watch("country"), form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    // In a real app, you would process the payment here
    router.push("/checkout/confirmation");
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card className="overflow-hidden border-0 shadow-lg">
          <CardHeader className="pb-8">
            <CardTitle className="text-xl">Información de Contacto</CardTitle>
            <CardDescription>
              Ingresa tus datos de contacto para la confirmación del pedido.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Juan"
                        {...field}
                        className="transition-all duration-200"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Apellido</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Pérez"
                        {...field}
                        className="transition-all duration-200"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="juan.perez@ejemplo.com"
                        {...field}
                        className="transition-all duration-200"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="(123) 456-7890"
                        {...field}
                        className="transition-all duration-200"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-0 shadow-lg">
          <CardHeader className=" pb-8">
            <CardTitle className="text-xl">Dirección de Envío</CardTitle>
            <CardDescription>
              Ingresa tu dirección de envío para la entrega.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dirección</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Calle Principal 123"
                      {...field}
                      className="transition-all duration-200"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>País</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        // Reset region when country changes
                        form.setValue("state", "");
                        form.setValue("zipCode", "");
                      }}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="transition-all duration-200">
                          <SelectValue placeholder="Seleccionar país" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="SV">El Salvador</SelectItem>
                        <SelectItem value="GT">Guatemala</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Región</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);

                        // Determinar qué regiones usar según el país seleccionado
                        const allRegions = [
                          ...elSalvadorRegions,
                          ...guatemalaRegions,
                        ];
                        const selectedRegion = allRegions.find(
                          (region) => region.id === value
                        );

                        if (selectedRegion && selectedRegion.codigoPostal) {
                          form.setValue("zipCode", selectedRegion.codigoPostal);
                        } else {
                          form.setValue("zipCode", "");
                        }
                      }}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="transition-all duration-200">
                          <SelectValue placeholder="Seleccionar región" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {selectedCountry === "SV" ? (
                          <>
                            {elSalvadorRegions.map((region) => (
                              <SelectItem key={region.id} value={region.id}>
                                El Salvador - {region.nombre}
                              </SelectItem>
                            ))}
                          </>
                        ) : selectedCountry === "GT" ? (
                          <>
                            {guatemalaRegions.map((region) => (
                              <SelectItem key={region.id} value={region.id}>
                                Guatemala - {region.nombre}
                              </SelectItem>
                            ))}
                          </>
                        ) : null}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ciudad</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ingrese su ciudad"
                        {...field}
                        className="transition-all duration-200"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="zipCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código Postal</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Código postal"
                        {...field}
                        className="transition-all duration-200"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-0 shadow-lg">
          <CardHeader className=" pb-8">
            <CardTitle className="text-xl">Método de Pago</CardTitle>
            <CardDescription>
              Selecciona tu método de pago preferido.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormControl>
                    <RadioGroup
                      onValueChange={(value) => {
                        field.onChange(value);
                        setPaymentTab(value);
                      }}
                      defaultValue={field.value}
                      className="grid grid-cols-2 gap-4"
                    >
                      <div className="col-span-1">
                        <FormItem className="flex flex-col space-y-1">
                          <FormControl>
                            <RadioGroupItem
                              value="credit"
                              className="peer sr-only"
                              id="credit"
                            />
                          </FormControl>
                          <FormLabel
                            htmlFor="credit"
                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                          >
                            <CreditCard className="mb-3 h-6 w-6" />
                            Tarjeta de Crédito
                          </FormLabel>
                        </FormItem>
                      </div>

                      <div className="col-span-1">
                        <FormItem className="flex flex-col space-y-1">
                          <FormControl>
                            <RadioGroupItem
                              value="paypal"
                              className="peer sr-only"
                              id="paypal"
                            />
                          </FormControl>
                          <FormLabel
                            htmlFor="paypal"
                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="mb-3 h-6 w-6"
                            >
                              <path d="M7 11V7a5 5 0 0 1 9.9-1" />
                              <path d="M8 21h8a4 4 0 0 0 4-4v-3a3 3 0 0 0-3-3h-1" />
                              <path d="M10 13H8a3 3 0 0 0-3 3v3a4 4 0 0 0 4 4h2" />
                              <path d="M7 15a2 2 0 0 1 2-2" />
                              <path d="M17 15a2 2 0 0 0-2-2" />
                            </svg>
                            PayPal
                          </FormLabel>
                        </FormItem>
                      </div>

                      <div className="col-span-1">
                        <FormItem className="flex flex-col space-y-1">
                          <FormControl>
                            <RadioGroupItem
                              value="wompi"
                              className="peer sr-only"
                              id="wompi"
                            />
                          </FormControl>
                          <FormLabel
                            htmlFor="wompi"
                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="mb-3 h-6 w-6"
                            >
                              <path d="M16 2v5h5" />
                              <path d="M21 6v6.5c0 .8-.7 1.5-1.5 1.5h-7c-.8 0-1.5-.7-1.5-1.5v-9c0-.8.7-1.5 1.5-1.5H17l4 4z" />
                              <path d="M7 8v8.8c0 .3.2.6.4.8.2.2.5.4.8.4H15" />
                              <path d="M3 12h4v8H3z" />
                            </svg>
                            Wompi
                          </FormLabel>
                        </FormItem>
                      </div>

                      <div className="col-span-1">
                        <FormItem className="flex flex-col space-y-1">
                          <FormControl>
                            <RadioGroupItem
                              value="googlepay"
                              className="peer sr-only"
                              id="googlepay"
                            />
                          </FormControl>
                          <FormLabel
                            htmlFor="googlepay"
                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="mb-3 h-6 w-6"
                            >
                              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                            </svg>
                            Google Pay
                          </FormLabel>
                        </FormItem>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Tabs value={paymentTab} className="mt-6">
              <TabsContent value="credit" className="space-y-4">
                <div className="rounded-lg p-4 border">
                  <div className="flex justify-between items-center mb-4">
                    <div className="text-sm text-secondary-foreground">
                      Tarjetas aceptadas
                    </div>
                    <div className="flex space-x-2">
                      <Image
                        width={70}
                        height={70}
                        src={"/tarjetas.svg"}
                        alt="tarjetas"
                      />
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="cardNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número de Tarjeta</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="4242 4242 4242 4242"
                            {...field}
                            onChange={(e) => {
                              // Format card number with spaces
                              const value = e.target.value.replace(/\s/g, "");
                              const formattedValue = value.replace(
                                /(\d{4})(?=\d)/g,
                                "$1 "
                              );
                              field.onChange(formattedValue);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="cardName"
                    render={({ field }) => (
                      <FormItem className="mt-4">
                        <FormLabel>Nombre en la Tarjeta</FormLabel>
                        <FormControl>
                          <Input placeholder="Juan Pérez" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <FormField
                      control={form.control}
                      name="cardExpiry"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fecha de Expiración</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="MM/YY"
                              {...field}
                              onChange={(e) => {
                                // Format expiry date
                                const value = e.target.value.replace(/\D/g, "");
                                if (value.length <= 2) {
                                  field.onChange(value);
                                } else {
                                  field.onChange(
                                    `${value.slice(0, 2)}/${value.slice(2, 4)}`
                                  );
                                }
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="cardCvc"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CVC</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="123"
                              {...field}
                              maxLength={4}
                              onChange={(e) => {
                                // Only allow numbers
                                const value = e.target.value.replace(/\D/g, "");
                                field.onChange(value);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="mt-4 text-xs p-3 rounded flex items-start gap-2">
                    <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <p>
                      Los pagos se procesarán a través de Wompi 3DS con un cargo
                      del 3.50% por transacción.
                    </p>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="paypal">
                <div className="rounded-lg p-6 text-center border">
                  <div className="mx-auto mb-4 w-16 h-16 flex items-center justify-center rounded-full">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-slate-600"
                    >
                      <path d="M7 11V7a5 5 0 0 1 9.9-1" />
                      <path d="M8 21h8a4 4 0 0 0 4-4v-3a3 3 0 0 0-3-3h-1" />
                      <path d="M10 13H8a3 3 0 0 0-3 3v3a4 4 0 0 0 4 4h2" />
                      <path d="M7 15a2 2 0 0 1 2-2" />
                      <path d="M17 15a2 2 0 0 0-2-2" />
                    </svg>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Serás redirigido a PayPal para completar tu pago de forma
                    segura.
                  </p>
                  <div className="mt-4 text-xs p-3 rounded flex items-start gap-2 max-w-xs mx-auto">
                    <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <p>Cargo por transacción: 3.50%</p>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="wompi">
                <div className="rounded-lg p-6 text-center border">
                  <div className="mx-auto mb-4 w-16 h-16 flex items-center justify-center rounded-full">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-slate-600"
                    >
                      <path d="M16 2v5h5" />
                      <path d="M21 6v6.5c0 .8-.7 1.5-1.5 1.5h-7c-.8 0-1.5-.7-1.5-1.5v-9c0-.8.7-1.5 1.5-1.5H17l4 4z" />
                      <path d="M7 8v8.8c0 .3.2.6.4.8.2.2.5.4.8.4H15" />
                      <path d="M3 12h4v8H3z" />
                    </svg>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Serás redirigido a Wompi para completar tu pago de forma
                    segura.
                  </p>
                  <div className="flex justify-center space-x-2 mb-3">
                    <div className="w-10 h-6 bg-red-500 rounded flex items-center justify-center text-white text-xs font-bold">
                      VISA
                    </div>
                    <div className="flex h-6">
                      <div className="w-5 h-6 bg-yellow-500 rounded-l"></div>
                      <div className="w-5 h-6 bg-red-500 rounded-r"></div>
                    </div>
                  </div>
                  <div className="text-xs text-slate-500 p-3 rounded inline-block">
                    <p className="font-medium">Wompi 3DS</p>
                    <p>Cargo por transacción: 3.50%</p>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="googlepay">
                <div className="rounded-lg  p-6 text-center border">
                  <div className="mx-auto mb-4 w-16 h-16 flex items-center justify-center rounded-full">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-slate-600"
                    >
                      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                    </svg>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Completa tu pago de forma rápida y segura con Google Pay.
                  </p>
                  <div className="mt-4 text-xs text-slate-500 p-3 rounded flex items-start gap-2 max-w-xs mx-auto">
                    <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <p>Cargo por transacción: 3.50%</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className=" pt-6">
            <Button
              type="submit"
              className="w-full transition-all duration-300"
            >
              Completar Pedido
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
