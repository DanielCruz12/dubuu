"use client";

import { useState, useEffect, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { User, Mail, Building, MessageSquare, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ReCAPTCHA from "react-google-recaptcha";
import { PhoneInputComponent } from "@/components/phone-input";
import { verifyRecaptcha } from "@/lib/recaptcha";
import { useUser } from "@clerk/nextjs";
import { useSendContactMessageMutation } from "@/redux/slices/contact/contact-slice";

const formSchema = z.object({
  nombre: z.string().min(2, "El nombre es requerido"),
  apellido: z.string().min(2, "El apellido es requerido"),
  email: z.string().email("Dirección de correo electrónico inválida"),
  telefono: z.string().min(10, "Número de teléfono inválido"),
  tipoServicio: z.enum(["tour", "alquilerAuto", "propiedad"], {
    required_error: "Seleccione un tipo de servicio",
  }),
  mensaje: z
    .string()
    .min(10, "Por favor, proporcione más detalles sobre su solicitud"),
  terminosCondiciones: z
    .boolean()
    .refine((val) => val === true, "Debe aceptar los términos y condiciones"),
  recaptcha: z.string().min(1, "Por favor, complete el reCAPTCHA"),
});

type FormValues = z.infer<typeof formSchema>;

export default function ContactForm() {
  const { user, isSignedIn: isAuthenticated } = useUser();
  const [sendContactMessage, { isLoading: isSending }] =
    useSendContactMessageMutation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recaptchaValue, setRecaptchaValue] = useState<string | null>(null);
  const [preferredContact, setPreferredContact] = useState<
    "email" | "telefono"
  >("email");
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre: "",
      apellido: "",
      email: "",
      telefono: "",
      tipoServicio: "tour",
      mensaje: "",
      terminosCondiciones: false,
      recaptcha: "",
    },
  });

  // Pre-fill form with user data when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      form.setValue("nombre", user.firstName || "");
      form.setValue("apellido", user.lastName || "");
      form.setValue("email", user.primaryEmailAddress?.emailAddress || "");
    }
  }, [isAuthenticated, user, form]);

  // Actualizar el valor del reCAPTCHA en el formulario cuando cambie
  useEffect(() => {
    if (recaptchaValue) {
      form.setValue("recaptcha", recaptchaValue);
    }
  }, [recaptchaValue, form]);

  async function onSubmit(values: FormValues) {
    if (!isAuthenticated) {
      toast.error("Por favor, inicie sesión para enviar su solicitud.", {
        description: "Debe estar autenticado para enviar el formulario.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Verificar reCAPTCHA en el servidor
      const recaptchaVerified = await verifyRecaptcha(values.recaptcha);

      if (!recaptchaVerified.success) {
        toast.error("Error de verificación de reCAPTCHA", {
          description: "Por favor, complete el reCAPTCHA nuevamente.",
        });
        // Resetear reCAPTCHA
        recaptchaRef.current?.reset();
        setRecaptchaValue(null);
        form.setValue("recaptcha", "");
        setIsSubmitting(false);
        return;
      }

      // Prepare data for API exactly as required
      const contactMessage = {
        nombre: values.nombre,
        apellido: values.apellido,
        email: values.email,
        telefono: values.telefono,
        tipoServicio: values.tipoServicio,
        mensaje: values.mensaje,
        terminosCondiciones: values.terminosCondiciones,
      };

      // Send data to API using Redux Toolkit Query
      await sendContactMessage(contactMessage).unwrap();

      // Mostrar mensaje de éxito
      toast.success("¡Solicitud enviada con éxito!", {
        description: `Nos pondremos en contacto con usted a través de su ${
          preferredContact === "email" ? "correo electrónico" : "teléfono"
        } en breve.`,
        duration: 5000,
      });

      // Resetear formulario
      form.reset();
      setRecaptchaValue(null);
      recaptchaRef.current?.reset();

      // If user is authenticated, pre-fill the form again
      if (isAuthenticated && user) {
        form.setValue("nombre", user.firstName || "");
        form.setValue("apellido", user.lastName || "");
        form.setValue("email", user.primaryEmailAddress?.emailAddress || "");
      }
    } catch (err) {
      console.error("Error al enviar el formulario:", err);
      toast.error("Error al enviar el formulario", {
        description:
          "Por favor, inténtelo de nuevo más tarde o contáctenos directamente.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleRecaptchaChange = (value: string | null) => {
    setRecaptchaValue(value);
    if (value) {
      form.setValue("recaptcha", value);
      form.clearErrors("recaptcha");
    } else {
      form.setValue("recaptcha", "");
    }
  };

  return (
    <div className="w-full py-12 rounded-xl shadow-sm">
      <div className="px-4 md:px-20 mx-auto">
        <div className="grid lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3">
            <Card className="border">
              <CardHeader className=" rounded-t-lg">
                <CardTitle className="text-2xl font-bold">
                  Solicitud de Listado - Dubuu
                </CardTitle>
                <CardDescription>
                  Complete el formulario para listar su producto o servicio en
                  nuestra plataforma
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6 pb-4"
                  >
                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="nombre"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nombre</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <User className="absolute left-3 top-3 h-4 w-4" />
                                <Input
                                  className="pl-9"
                                  placeholder="Ingrese su nombre"
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="apellido"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Apellido</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                  className="pl-9"
                                  placeholder="Ingrese su apellido"
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Correo Electrónico</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                              <Input
                                className="pl-9"
                                placeholder="correo@ejemplo.com"
                                type="email"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="telefono"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Número de Teléfono</FormLabel>
                          <FormControl>
                            <PhoneInputComponent
                              value={field.value}
                              onChange={(value) => field.onChange(value || "")}
                              onBlur={field.onBlur}
                              defaultCountry="SV"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="tipoServicio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo de Servicio</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <div className="relative">
                                <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400 z-10" />
                                <SelectTrigger className="pl-9">
                                  <SelectValue placeholder="Seleccione un tipo de servicio" />
                                </SelectTrigger>
                              </div>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="tour">Tour / Viaje</SelectItem>
                              <SelectItem value="alquilerAuto">
                                Alquiler de Auto
                              </SelectItem>
                              <SelectItem value="propiedad">
                                Venta de Propiedad
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="mensaje"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Detalles del Servicio</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                              <Textarea
                                placeholder="Describa los detalles de su servicio o producto..."
                                className="min-h-[150px] pl-9 pt-7"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormDescription>
                            Incluya información relevante como ubicación,
                            precios, características, etc.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="space-y-2">
                      <div className="text-sm font-medium">
                        Método de contacto preferido
                      </div>
                      <div className="flex space-x-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="contact-email"
                            checked={preferredContact === "email"}
                            onCheckedChange={() => setPreferredContact("email")}
                          />
                          <label htmlFor="contact-email" className="text-sm">
                            Correo electrónico
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="contact-phone"
                            checked={preferredContact === "telefono"}
                            onCheckedChange={() =>
                              setPreferredContact("telefono")
                            }
                          />
                          <label htmlFor="contact-phone" className="text-sm">
                            Teléfono
                          </label>
                        </div>
                      </div>
                    </div>

                    <FormField
                      control={form.control}
                      name="recaptcha"
                      render={() => (
                        <FormItem>
                          <FormLabel>Verificación de Seguridad</FormLabel>
                          <FormControl>
                            <ReCAPTCHA
                              ref={recaptchaRef}
                              sitekey={
                                process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ""
                              }
                              onChange={handleRecaptchaChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="terminosCondiciones"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-sm">
                              Acepto los{" "}
                              <Link
                                href="/terms"
                                className="text-gray-700 hover:underline"
                              >
                                Términos y Condiciones
                              </Link>{" "}
                              y la{" "}
                              <Link
                                href="/privacy"
                                className="text-gray-700 hover:underline"
                              >
                                Política de Privacidad
                              </Link>
                            </FormLabel>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full bg-black hover:bg-gray-800 text-white"
                      disabled={isSubmitting || isSending || !isAuthenticated}
                    >
                      {isSubmitting || isSending
                        ? "Enviando..."
                        : "Enviar solicitud"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <div className="space-y-6">
              <Card className="border p-6">
                <div className="flex items-start space-x-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      ¿Por qué listar con Dubuu?
                    </h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-gray-700" />
                        <span>Aumente sus ingresos con nuestra plataforma</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-gray-700" />
                        <span>Alcance a miles de clientes potenciales</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-gray-700" />
                        <span>Gestión simplificada de reservas</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-gray-700" />
                        <span>Soporte personalizado 24/7</span>
                      </li>
                    </ul>
                    <p className="mt-4 text-sm text-gray-600">
                      Después de enviar su solicitud, un representante se pondrá
                      en contacto con usted para programar una llamada y
                      discutir los detalles.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
