"use client";

import type React from "react";

import { useState, useRef, useMemo, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useAuth } from "@clerk/nextjs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { isValidPhoneNumber } from "react-phone-number-input";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n-context";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Loader2,
  Mail,
  Check,
  Camera,
  Upload,
  X,
  User,
  AtSign,
  Calendar,
  Shield,
} from "lucide-react";
import { toast } from "sonner";
import { PersonalInfoSkeleton } from "./skeletons/personal-info-skeleton";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useClerkToken } from "@/components/providers/auth-provider";
import HostProfileEditForm, {
  type HostProfileEditFormHandle,
} from "@/components/host-profile-edit-form";
import { PhoneInputComponent } from "@/components/phone-input";
import {
  useGetUserQuery,
  useUpdateUserMutation,
} from "@/redux/slices/user/user-slice";
import { usePatchHostProfileMutation } from "@/redux/slices/host/host-profile-slice";

type PersonalInfoValues = {
  firstName: string;
  lastName: string;
  phone: string;
};

function getPersonalInfoSchema(t: (key: string) => string) {
  return z.object({
    firstName: z.string().min(2, {
      message: t("dashboard.profile.validation.firstNameMin"),
    }),
    lastName: z.string().min(2, {
      message: t("dashboard.profile.validation.lastNameMin"),
    }),
    phone: z.string().refine(
      (v) => !v.trim() || isValidPhoneNumber(v.trim()),
      { message: t("dashboard.profile.validation.phoneInvalid") },
    ),
  });
}

function toStoredPhoneNumber(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  const parsed = parsePhoneNumberFromString(trimmed);
  return parsed?.number ?? trimmed;
}

export default function PersonalInfoForm() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const { hasRole } = useClerkToken();
  const { t, language } = useLanguage();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isChangingEmail, setIsChangingEmail] = useState(false);
  const [isUpdatingPhoto, setIsUpdatingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hostProfileRef = useRef<HostProfileEditFormHandle>(null);
  const { data: dbUser } = useGetUserQuery(user?.id ?? "", {
    skip: !isLoaded || !user?.id,
  });
  const [updateUser] = useUpdateUserMutation();
  const [patchHostProfile] = usePatchHostProfileMutation();

  const personalInfoSchema = useMemo(() => getPersonalInfoSchema(t), [t]);

  const form = useForm<PersonalInfoValues>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      phone: dbUser?.phone_number ?? "",
    },
  });

  useEffect(() => {
    if (isLoaded && user) {
      form.reset({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phone: dbUser?.phone_number ?? "",
      });
    }
  }, [
    isLoaded,
    user?.id,
    user?.firstName,
    user?.lastName,
    dbUser?.phone_number,
    form,
    user
  ]);

  async function savePersonalAndHost() {
    if (!user) return;
    const okPersonal = await form.trigger();
    if (!okPersonal) return;

    setIsUpdating(true);
    try {
      await user.update({
        firstName: form.getValues("firstName"),
        lastName: form.getValues("lastName"),
      });

      const phoneRaw = form.getValues("phone");
      if (phoneRaw.trim() && !isValidPhoneNumber(phoneRaw.trim())) {
        toast.error(t("dashboard.profile.validation.phoneInvalid"));
        return;
      }

      try {
        await updateUser({
          id: user.id,
          data: {
            email: user.primaryEmailAddress?.emailAddress ?? "",
            username: user.username ?? "",
            first_name: form.getValues("firstName"),
            last_name: form.getValues("lastName"),
            phone_number: toStoredPhoneNumber(phoneRaw),
          },
        }).unwrap();
      } catch (e) {
        console.error(e);
        toast.error(t("dashboard.profile.toast.profileError"), {
          description: t("dashboard.profile.toast.profileErrorDescription"),
        });
        return;
      }

      if (hasRole("host") && hostProfileRef.current) {
        const hostOk = await hostProfileRef.current.submit();
        if (!hostOk) {
          toast.error("Revisa el perfil de operador", {
            description:
              "Corrige los campos marcados en la sección inferior e inténtalo de nuevo.",
          });
          return;
        }
      }

      toast.success(t("dashboard.profile.toast.profileUpdated"), {
        description: t("dashboard.profile.toast.profileUpdatedDescription"),
      });
    } catch (error) {
      console.error(error);
      toast.error(t("dashboard.profile.toast.profileError"), {
        description: t("dashboard.profile.toast.profileErrorDescription"),
      });
    } finally {
      setIsUpdating(false);
    }
  }

  const handleEmailChange = async (emailAddressId: string) => {
    if (!user) return;

    setIsChangingEmail(true);
    try {
      await user.update({
        primaryEmailAddressId: emailAddressId,
      });

      toast.success(t("dashboard.profile.toast.emailUpdated"), {
        description: t("dashboard.profile.toast.emailUpdatedDescription"),
      });
    } catch (e) {
      if (e instanceof Error && e.message.includes("verification")) {
        toast.error(t("dashboard.profile.toast.verificationCancelled"), {
          description: t("dashboard.profile.toast.verificationCancelledDescription"),
        });
      } else {
        toast.error(t("dashboard.profile.toast.emailError"), {
          description: t("dashboard.profile.toast.emailErrorDescription"),
        });
      }
      console.error(e);
    } finally {
      setIsChangingEmail(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error(t("dashboard.profile.toast.invalidFileType"), {
        description: t("dashboard.profile.toast.invalidFileTypeDescription"),
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t("dashboard.profile.toast.fileTooLarge"), {
        description: t("dashboard.profile.toast.fileTooLargeDescription"),
      });
      return;
    }

    setIsUpdatingPhoto(true);
    try {
      await user.setProfileImage({ file });
      // Mantener host_profile.image_url en sync con Clerk (para que se vea en tours, organizer, etc.)
      if (hasRole("host")) {
        try {
          const token = await getToken();
          await patchHostProfile({
            token: token ?? undefined,
            body: {
              locale: language,
              user_id: user.id,
              data: {
                image_url: user.imageUrl?.trim() || undefined,
              },
              // compat (legacy)
              image_url: user.imageUrl?.trim() || undefined,
            },
          }).unwrap();
        } catch (e) {
          // No bloqueamos el flujo del usuario si falla el sync con el backend
          console.error(e);
        }
      }
      toast.success(t("dashboard.profile.toast.photoUpdated"), {
        description: t("dashboard.profile.toast.photoUpdatedDescription"),
      });
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error(error);
      toast.error(t("dashboard.profile.toast.photoError"), {
        description: t("dashboard.profile.toast.photoErrorDescription"),
      });
    } finally {
      setIsUpdatingPhoto(false);
    }
  };

  const handleRemovePhoto = async () => {
    if (!user) return;

    setIsUpdatingPhoto(true);
    try {
      await user.setProfileImage({ file: null });
      if (hasRole("host")) {
        try {
          const token = await getToken();
          await patchHostProfile({
            token: token ?? undefined,
            body: {
              locale: language,
              user_id: user.id,
              data: {
                image_url: undefined,
              },
              // compat (legacy)
              image_url: undefined,
            },
          }).unwrap();
        } catch (e) {
          console.error(e);
        }
      }
      toast.success(t("dashboard.profile.toast.photoRemoved"), {
        description: t("dashboard.profile.toast.photoRemovedDescription"),
      });
    } catch (error) {
      console.error(error);
      toast.error(t("dashboard.profile.toast.photoRemoveError"), {
        description: t("dashboard.profile.toast.photoRemoveErrorDescription"),
      });
    } finally {
      setIsUpdatingPhoto(false);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  if (!isLoaded) {
    return <PersonalInfoSkeleton />;
  }

  // Get user initials for avatar fallback
  const getInitials = () => {
    const firstName = user?.firstName || "";
    const lastName = user?.lastName || "";
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  // Format date for profile display (respects current language)
  const formatDate = (date: Date | null | undefined) => {
    if (!date) return t("dashboard.profile.notAvailable");
    const locale = language === "en" ? "en-US" : "es-ES";
    return new Intl.DateTimeFormat(locale, {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  };

  return (
    <div className="w-full mx-auto">
      {/* Profile Header - Responsive */}
      <div className="relative mb-8 pt-4">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="relative group">
            <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 shadow-xl">
              <AvatarImage
                src={user?.imageUrl || "/logo.svg"}
                alt={user?.fullName || "Profile"}
              />
              <AvatarFallback className="text-2xl  ">
                {getInitials()}
              </AvatarFallback>
            </Avatar>

            <div
              className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full opacity-100 transition-opacity cursor-pointer"
              onClick={triggerFileInput}
            >
              <Camera className="h-6 w-6 md:h-8 md:w-8 text-white" />
            </div>

            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handlePhotoUpload}
            />
          </div>

          <div className="text-center md:text-left">
            <h1 className="text-xl md:text-2xl font-bold">
              {user?.firstName} {user?.lastName}
            </h1>
            <p className="text-gray-500 flex items-center justify-center md:justify-start gap-1 mt-1">
              <AtSign className="h-4 w-4" />
              {user?.username || "username"}
            </p>

            <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-3">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {t("dashboard.profile.memberSince").replace(
                  "{{date}}",
                  formatDate(user?.createdAt)
                )}
              </Badge>

              <Badge variant="success" className="flex items-center gap-1">
                <Shield className="h-3 w-3" />
                {t("dashboard.profile.verifiedAccount")}
              </Badge>
            </div>
          </div>

          <div className="hidden md:flex gap-2 mt-4 md:mt-0 md:ml-auto">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={triggerFileInput}
              disabled={isUpdatingPhoto}
              className=""
            >
              {isUpdatingPhoto ? (
                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
              ) : (
                <Upload className="mr-2 h-3 w-3" />
              )}
              {t("dashboard.profile.updatePhoto")}
            </Button>

            {user?.imageUrl && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRemovePhoto}
                disabled={isUpdatingPhoto}
                className=" text-red-500 hover:text-red-600"
              >
                <X className="mr-2 h-3 w-3" />
                {t("dashboard.profile.delete")}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Profile Content - Responsive Tabs */}
      <Tabs defaultValue="personal" className="mb-8 px-4">
        <TabsList className="w-full mb-6 grid grid-cols-2">
          <TabsTrigger
            value="personal"
            className="flex items-center justify-center gap-2"
          >
            <User className="h-4 w-4" />
            {t("dashboard.profile.tabPersonalInfo")}
          </TabsTrigger>
          <TabsTrigger
            value="email"
            className="flex items-center justify-center gap-2"
          >
            <Mail className="h-4 w-4" />
            {t("dashboard.profile.tabEmails")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personal">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">
                {t("dashboard.profile.personalInfoTitle")}
              </CardTitle>
              <CardDescription>
                {t("dashboard.profile.personalInfoDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:items-start">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel>{t("dashboard.profile.firstName")}</FormLabel>
                          <FormControl>
                            <Input placeholder="John" className="h-9" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel>{t("dashboard.profile.lastName")}</FormLabel>
                          <FormControl>
                            <Input placeholder="Doe" className="h-9" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>{t("dashboard.profile.phone")}</FormLabel>
                        <FormControl>
                          <PhoneInputComponent
                            value={field.value ?? ""}
                            onChange={(v) => field.onChange(v ?? "")}
                            onBlur={field.onBlur}
                            showValidityHint={false}
                          />
                        </FormControl>
                        <FormDescription>
                          {t("dashboard.profile.phoneDescription")}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                </div>
              </Form>

              {hasRole("host") ? (
                <>
                  <Separator className="my-8" />
                  <HostProfileEditForm
                    ref={hostProfileRef}
                    embedded
                    hideSubmitButton
                  />
                </>
              ) : null}

              <div className="mt-6 flex justify-end">
                <Button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => void savePersonalAndHost()}
                >
                  {isUpdating && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {t("dashboard.profile.saveChanges")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">
                {t("dashboard.profile.emailManagementTitle")}
              </CardTitle>
              <CardDescription>
                {t("dashboard.profile.emailManagementDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className=" p-4 rounded-lg">
                <h3 className="text-sm font-medium mb-2">
                  {t("dashboard.profile.primaryEmail")}
                </h3>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3  p-4 rounded-md shadow-sm">
                  <div className=" p-2 rounded-full">
                    <Mail className="h-5 w-5 " />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium break-all">
                      {user?.primaryEmailAddress?.emailAddress}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {t("dashboard.profile.primaryEmailDescription")}
                    </p>
                  </div>
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-0 mt-2 sm:mt-0">
                    <Check className="h-3 w-3 mr-1" />{" "}
                    {t("dashboard.profile.primaryBadge")}
                  </Badge>
                </div>
              </div>

              {user?.emailAddresses && user.emailAddresses.length > 1 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">
                    {t("dashboard.profile.additionalEmails")}
                  </h3>
                  <ul className="space-y-3">
                    {user.emailAddresses.map(
                      (email) =>
                        email.id !== user.primaryEmailAddress?.id && (
                          <li
                            key={email.id}
                            className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4  rounded-lg  transition-colors gap-3"
                          >
                            <div className="flex items-center gap-3">
                              <div className=" p-2 rounded-full">
                                <Mail className="h-5 w-5 text-gray-600" />
                              </div>
                              <span className="font-medium break-all">
                                {email.emailAddress}
                              </span>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEmailChange(email.id)}
                              disabled={isChangingEmail}
                              className="   w-full sm:w-auto"
                            >
                              {isChangingEmail ? (
                                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                              ) : (
                                <Check className="mr-2 h-3 w-3" />
                              )}
                              {t("dashboard.profile.makePrimary")}
                            </Button>
                          </li>
                        )
                    )}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
