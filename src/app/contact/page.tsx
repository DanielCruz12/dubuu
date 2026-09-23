"use client";

import { useState, useEffect, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { User, Mail, Building, MessageSquare, CheckCircle } from "lucide-react";
import { useLanguage } from "@/lib/i18n-context";
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
import { useRouter } from "next/navigation";
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

function getContactFormSchema(t: (path: string) => string) {
  return z.object({
    nombre: z.string().min(2, t("contact.validation.nameRequired")),
    apellido: z.string().min(2, t("contact.validation.lastNameRequired")),
    email: z.string().email(t("contact.validation.invalidEmail")),
    telefono: z.string().min(10, t("contact.validation.invalidPhone")),
    tipoServicio: z.enum(["tour", "alquilerAuto", "propiedad"], {
      required_error: t("contact.validation.selectServiceType"),
    }),
    mensaje: z.string().min(10, t("contact.validation.messageMin")),
    terminosCondiciones: z
      .boolean()
      .refine((val) => val === true, t("contact.validation.acceptTerms")),
    recaptcha: z.string().min(1, t("contact.validation.recaptchaRequired")),
  });
}

type FormValues = z.infer<ReturnType<typeof getContactFormSchema>>;

export default function ContactForm() {
  const { t } = useLanguage();
  const router = useRouter();
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
    resolver: zodResolver(getContactFormSchema(t)),
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
    setIsSubmitting(true);

    try {
      // Verificar reCAPTCHA en el servidor
      const recaptchaVerified = await verifyRecaptcha(values.recaptcha);

      if (!recaptchaVerified.success) {
        toast.error(t("contact.toast.recaptchaError"), {
          description: t("contact.toast.recaptchaDescription"),
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

      toast.success(t("contact.toast.success"), {
        description: isAuthenticated
          ? preferredContact === "email"
            ? t("contact.toast.successDescriptionEmail")
            : t("contact.toast.successDescriptionPhone")
          : t("contact.toast.successCreateAccount"),
        duration: 5000,
      });

      // Sin sesión: invitamos a crear cuenta. Con sesión: al inicio.
      router.push(isAuthenticated ? "/home" : "/sign-up");

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
      toast.error(t("contact.toast.error"), {
        description: t("contact.toast.errorDescription"),
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
          <div className="order-2 lg:order-1 lg:col-span-3">
            <Card className="border">
              <CardHeader className=" rounded-t-lg">
                <CardTitle className="text-lg font-bold">
                  {t("contact.title")}
                </CardTitle>
                <CardDescription>
                  {t("contact.description")}
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
                            <FormLabel>{t("contact.labels.firstName")}</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <User className="absolute left-3 top-3 h-4 w-4" />
                                <Input
                                  className="pl-9"
                                  placeholder={t("contact.placeholders.firstName")}
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
                            <FormLabel>{t("contact.labels.lastName")}</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                  className="pl-9"
                                  placeholder={t("contact.placeholders.lastName")}
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
                          <FormLabel>{t("contact.labels.email")}</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                              <Input
                                className="pl-9"
                                placeholder={t("contact.placeholders.email")}
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
                          <FormLabel>{t("contact.labels.phone")}</FormLabel>
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
                          <FormLabel>{t("contact.labels.serviceType")}</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <div className="relative">
                                <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400 z-10" />
                                <SelectTrigger className="pl-9">
                                  <SelectValue placeholder={t("contact.placeholders.serviceType")} />
                                </SelectTrigger>
                              </div>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="tour">{t("contact.serviceTypes.tour")}</SelectItem>
                              <SelectItem value="alquilerAuto">
                                {t("contact.serviceTypes.alquilerAuto")}
                              </SelectItem>
                              <SelectItem value="propiedad">
                                {t("contact.serviceTypes.propiedad")}
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
                          <FormLabel>{t("contact.labels.serviceDetails")}</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                              <Textarea
                                placeholder={t("contact.placeholders.serviceDetails")}
                                className="min-h-[150px] pl-9 pt-7"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormDescription>
                            {t("contact.formDescription")}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="space-y-2">
                      <div className="text-sm font-medium">
                        {t("contact.labels.preferredContact")}
                      </div>
                      <div className="flex space-x-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="contact-email"
                            checked={preferredContact === "email"}
                            onCheckedChange={() => setPreferredContact("email")}
                          />
                          <label htmlFor="contact-email" className="text-sm">
                            {t("contact.labels.emailOption")}
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
                            {t("contact.labels.phoneOption")}
                          </label>
                        </div>
                      </div>
                    </div>

                    <FormField
                      control={form.control}
                      name="recaptcha"
                      render={() => (
                        <FormItem>
                          <FormLabel>{t("contact.labels.securityVerification")}</FormLabel>
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
                              {t("contact.labels.acceptTerms")}{" "}
                              <Link
                                href="/terms"
                                className="text-gray-700 hover:underline"
                              >
                                {t("contact.labels.termsAndConditions")}
                              </Link>{" "}
                              {t("contact.labels.andThe")}{" "}
                              <Link
                                href="/privacy"
                                className="text-gray-700 hover:underline"
                              >
                                {t("contact.labels.privacyPolicy")}
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
                      disabled={isSubmitting || isSending}
                    >
                      {isSubmitting || isSending
                        ? t("contact.submitting")
                        : t("contact.submit")}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          <div className="order-1 lg:order-2 lg:col-span-2">
            <div className="space-y-6">
              <Card className="border p-6">
                <div className="flex items-start space-x-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      {t("contact.whyList")}
                    </h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-gray-700" />
                        <span>{t("contact.benefits.income")}</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-gray-700" />
                        <span>{t("contact.benefits.reach")}</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-gray-700" />
                        <span>{t("contact.benefits.management")}</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-gray-700" />
                        <span>{t("contact.benefits.support")}</span>
                      </li>
                    </ul>
                    <p className="mt-4 text-sm text-muted-foreground">
                      {t("contact.afterSubmit")}
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
