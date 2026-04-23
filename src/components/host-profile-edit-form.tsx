"use client";

import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  forwardRef,
  useState,
} from "react";
import { useAuth } from "@clerk/nextjs";
import { useUser } from "@clerk/nextjs";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { HostPublicProfile } from "@/types/host-profile";
import {
  fetchHostPublicProfile,
  patchHostProfile,
} from "@/lib/host-profile-api";
import { useClerkToken } from "@/components/providers/auth-provider";
import { useGetProductCategoriesQuery } from "@/redux/slices/product/product-category";
import { useGetProductTypesQuery } from "@/redux/slices/product/product-types";
import {
  HOST_PROFILE_LANGUAGES,
  hostLanguagesFromProfile,
} from "@/constants/host-profile-languages";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useLanguage } from "@/lib/i18n-context";

function getHostProfileFormSchema(t: (key: string) => string) {
  return z.object({
    image_url: z
      .string()
      .url(t("dashboard.profile.hostProfile.errors.validUrl"))
      .optional()
      .or(z.literal("")),
    intro: z.string().max(220),
    descripcion: z.string().max(520),
    anosExperiencia: z.coerce
      .number()
      .int()
      .min(0, t("dashboard.profile.hostProfile.errors.min0"))
      .max(80, t("dashboard.profile.hostProfile.errors.max80")),
    especialidad: z
      .string()
      .min(1, t("dashboard.profile.hostProfile.errors.pickCategory"))
      .max(200),
    tipoExperiencias: z
      .string()
      .min(1, t("dashboard.profile.hostProfile.errors.pickType"))
      .max(200),
    estilo: z.string().max(500),
    idiomas: z
      .array(z.string())
      .min(1, t("dashboard.profile.hostProfile.errors.pickAtLeastOneLanguage"))
      .max(12),
  });
}

type HostProfileFormValues = z.infer<ReturnType<typeof getHostProfileFormSchema>>;

function detailValue(
  profile: HostPublicProfile,
  key: "specialty" | "experience_types" | "style",
): string {
  const row = profile.detalles?.find((d) => d.key === key);
  return row?.value ?? "";
}

function profileToFormValues(
  profile: HostPublicProfile,
): HostProfileFormValues {
  let idiomas = hostLanguagesFromProfile(profile.idiomas);
  if (!idiomas.length) idiomas = ["Español"];

  return {
    image_url: profile.imageUrl ?? "",
    intro: profile.intro ?? "",
    descripcion: profile.descripcion ?? "",
    anosExperiencia: profile.anosExperiencia ?? 0,
    especialidad: detailValue(profile, "specialty"),
    tipoExperiencias: detailValue(profile, "experience_types"),
    estilo: detailValue(profile, "style"),
    idiomas,
  };
}

export type HostProfileEditFormHandle = {
  /** Valida y envía el PATCH del perfil de operador. */
  submit: () => Promise<boolean>;
};

export interface HostProfileEditFormProps {
  embedded?: boolean;
  /** Si true, no se muestra el botón de guardar del operador (se usa el de la página). */
  hideSubmitButton?: boolean;
}

const HostProfileEditForm = forwardRef<
  HostProfileEditFormHandle,
  HostProfileEditFormProps
>(function HostProfileEditForm(
  { embedded = false, hideSubmitButton = false },
  ref,
) {
  const { t, language } = useLanguage();
  const { hasRole, isLoadingRole } = useClerkToken();
  const { userId, getToken, isLoaded: authLoaded } = useAuth();
  const { user, isLoaded: userLoaded } = useUser();
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadedProfile, setLoadedProfile] = useState<HostPublicProfile | null>(
    null,
  );

  const { data: categories = [], isLoading: loadingCategories } =
    useGetProductCategoriesQuery();
  const { data: productTypes = [], isLoading: loadingTypes } =
    useGetProductTypesQuery();

  const categoryNames = useMemo(
    () => new Set(categories.map((c) => c.name)),
    [categories],
  );
  const typeNames = useMemo(
    () => new Set(productTypes.map((c) => c.name)),
    [productTypes],
  );

  const hostProfileFormSchema = useMemo(() => getHostProfileFormSchema(t), [t]);
  const form = useForm<HostProfileFormValues>({
    resolver: zodResolver(hostProfileFormSchema),
    defaultValues: {
      intro: "",
      descripcion: "",
      anosExperiencia: 0,
      especialidad: "",
      tipoExperiencias: "",
      estilo: "",
      idiomas: ["Español"],
    },
  });

  const persistHostProfile = useCallback(
    async (values: HostProfileFormValues) => {
      const token = await getToken();
      if (!token) {
        toast.error(t("dashboard.profile.hostProfile.toast.loginRequired"));
        throw new Error("No token");
      }
      const clerkImageUrl =
        userLoaded && user?.imageUrl?.trim() ? user.imageUrl.trim() : undefined;
      const tipoName = values.tipoExperiencias.trim();
      const tiposExperiencia = tipoName ? [tipoName] : [];
      const body = {
        locale: language,
        // Si el usuario ya tiene foto en Clerk, úsala como default en host_profiles
        image_url: values.image_url?.trim() || clerkImageUrl || undefined,
        intro: values.intro.trim() || undefined,

        // Nuevo shape backend (snake_case)
        description: values.descripcion.trim() || undefined,
        years_experience: values.anosExperiencia,
        specialty: values.especialidad.trim() || undefined,
        experience_summary: tipoName || undefined,
        hosting_style: values.estilo.trim() || undefined,
        experience_tags: tiposExperiencia,
        languages: values.idiomas,

        // Legacy (por si algún endpoint viejo lo sigue esperando)
        descripcion: values.descripcion.trim() || undefined,
        anosExperiencia: values.anosExperiencia,
        especialidad: values.especialidad.trim() || undefined,
        tipoExperiencias: tipoName || undefined,
        estilo: values.estilo.trim() || undefined,
        tiposExperiencia,
        idiomas: values.idiomas,
      };
      await patchHostProfile(token, body);
      if (userId) {
        const refreshed = await fetchHostPublicProfile(userId, language);
        setLoadedProfile(refreshed);
        form.reset(profileToFormValues(refreshed));
      }
    },
    [getToken, form, user, userLoaded, t, language, userId],
  );

  const loadProfile = useCallback(async () => {
    if (!userId) return;
    setLoadError(null);
    try {
      const p = await fetchHostPublicProfile(userId, language);
      setLoadedProfile(p);
      form.reset(profileToFormValues(p));
    } catch (e) {
      setLoadedProfile(null);
      setLoadError(
        e instanceof Error
          ? e.message
          : t("dashboard.profile.hostProfile.errors.loadFailed"),
      );
    }
  }, [userId, form, t, language]);

  useImperativeHandle(
    ref,
    () => ({
      submit: () =>
        new Promise<boolean>((resolve) => {
          if (!hasRole("host")) {
            resolve(true);
            return;
          }
          void form.handleSubmit(
            async (values) => {
              try {
                await persistHostProfile(values);
                resolve(true);
              } catch {
                resolve(false);
              }
            },
            () => resolve(false),
          )();
        }),
    }),
    [form, hasRole, persistHostProfile],
  );

  useEffect(() => {
    if (!authLoaded || !userId || !hasRole("host")) return;
    void loadProfile();
  }, [authLoaded, userId, hasRole, loadProfile]);

  const orphanCategory = useMemo(() => {
    if (!loadedProfile) return null;
    const v = detailValue(loadedProfile, "specialty").trim();
    if (!v) return null;
    if (!categories.length) return v;
    return categoryNames.has(v) ? null : v;
  }, [loadedProfile, categories.length, categoryNames]);

  const orphanType = useMemo(() => {
    if (!loadedProfile) return null;
    const v = detailValue(loadedProfile, "experience_types").trim();
    if (!v) return null;
    if (!productTypes.length) return v;
    return typeNames.has(v) ? null : v;
  }, [loadedProfile, productTypes.length, typeNames]);

  useEffect(() => {
    if (!loadedProfile) return;
    if (!loadingCategories && categories.length) {
      const v = form.getValues("especialidad")?.trim();
      const valid =
        !!v &&
        (categoryNames.has(v) ||
          (orphanCategory !== null && v === orphanCategory));
      if (!valid && categories[0]) {
        form.setValue("especialidad", categories[0].name);
      }
    }
    if (!loadingTypes && productTypes.length) {
      const v = form.getValues("tipoExperiencias")?.trim();
      const valid =
        !!v && (typeNames.has(v) || (orphanType !== null && v === orphanType));
      if (!valid && productTypes[0]) {
        form.setValue("tipoExperiencias", productTypes[0].name);
      }
    }
  }, [
    loadedProfile,
    loadingCategories,
    loadingTypes,
    categories,
    productTypes,
    categoryNames,
    typeNames,
    orphanCategory,
    orphanType,
    form,
  ]);

  async function onSubmitHostOnly(values: HostProfileFormValues) {
    try {
      await persistHostProfile(values);
      toast.success(t("dashboard.profile.hostProfile.toast.updated"));
    } catch (e) {
      toast.error(
        e instanceof Error
          ? e.message
          : t("dashboard.profile.hostProfile.toast.saveError"),
      );
    }
  }

  if (isLoadingRole || !authLoaded) {
    const inner = (
      <div className="flex items-center gap-2 text-muted-foreground text-sm py-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        {t("dashboard.profile.hostProfile.checkingPermissions")}
      </div>
    );
    if (embedded) return inner;
    return (
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>{t("dashboard.profile.hostProfile.title")}</CardTitle>
          <CardDescription>{t("dashboard.profile.hostProfile.loading")}</CardDescription>
        </CardHeader>
        <CardContent>{inner}</CardContent>
      </Card>
    );
  }

  if (!hasRole("host")) {
    return null;
  }

  if (loadError && !loadedProfile) {
    const inner = (
      <div className="space-y-3">
        <p className="text-sm text-destructive">{loadError}</p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => void loadProfile()}
        >
          Reintentar
        </Button>
      </div>
    );
    if (embedded) {
      return (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
          <h3 className="text-lg md:text-xl font-semibold tracking-tight">
            {t("dashboard.profile.hostProfile.title")}
          </h3>
          {inner}
        </div>
      );
    }
    return (
      <Card className="mt-8 border-destructive/40">
        <CardHeader>
          <CardTitle>{t("dashboard.profile.hostProfile.title")}</CardTitle>
          <CardDescription>
            {t("dashboard.profile.hostProfile.hostOnlyHint")}
          </CardDescription>
        </CardHeader>
        <CardContent>{inner}</CardContent>
      </Card>
    );
  }

  const fieldsInner = (
    <>
      <div className="grid gap-3 sm:grid-cols-2 sm:items-start">
        <FormField
          control={form.control}
          name="intro"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="text-xs">
                {t("dashboard.profile.hostProfile.introLabel")}
              </FormLabel>
              <FormControl>
                <Input
                  maxLength={220}
                  placeholder={t("dashboard.profile.hostProfile.introPlaceholder")}
                  className="resize-none text-sm leading-snug"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="estilo"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="text-xs">
                {t("dashboard.profile.hostProfile.styleLabel")}
              </FormLabel>
              <FormControl>
                <Input
                  maxLength={220}
                  placeholder={t("dashboard.profile.hostProfile.stylePlaceholder")}
                  className="text-sm"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="descripcion"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-xs">
              {t("dashboard.profile.hostProfile.descriptionLabel")}
            </FormLabel>
            <FormControl>
              <Textarea
                rows={2}
                maxLength={520}
                placeholder={t("dashboard.profile.hostProfile.descriptionPlaceholder")}
                className="resize-none min-h-[5.5rem] text-sm leading-snug"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <FormField
          control={form.control}
          name="anosExperiencia"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs">
                {t("dashboard.profile.hostProfile.yearsLabel")}
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  min={0}
                  max={80}
                  autoComplete="off"
                  className="text-sm"
                  name={field.name}
                  ref={field.ref}
                  onBlur={field.onBlur}
                  value={Number.isFinite(field.value) ? field.value : 0}
                  onChange={(e) => {
                    const raw = e.target.value;
                    if (raw === "") {
                      field.onChange(0);
                      return;
                    }
                    const n = parseInt(raw, 10);
                    if (Number.isNaN(n)) field.onChange(0);
                    else field.onChange(Math.min(80, Math.max(0, n)));
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="especialidad"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs">
                {t("dashboard.profile.hostProfile.specialtyLabel")}
              </FormLabel>
              <Select
                disabled={loadingCategories || !categories.length}
                value={field.value}
                onValueChange={field.onChange}
              >
                <FormControl>
                  <SelectTrigger className="text-sm h-9">
                    <SelectValue
                      placeholder={t("dashboard.profile.hostProfile.specialtyPlaceholder")}
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {orphanCategory ? (
                    <SelectItem value={orphanCategory}>
                      {orphanCategory}
                    </SelectItem>
                  ) : null}
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.name}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="tipoExperiencias"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs">
                {t("dashboard.profile.hostProfile.experienceTypeLabel")}
              </FormLabel>
              <Select
                disabled={loadingTypes || !productTypes.length}
                value={field.value}
                onValueChange={field.onChange}
              >
                <FormControl>
                  <SelectTrigger className="text-sm h-9">
                    <SelectValue
                      placeholder={t(
                        "dashboard.profile.hostProfile.experienceTypePlaceholder",
                      )}
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {orphanType ? (
                    <SelectItem value={orphanType}>{orphanType}</SelectItem>
                  ) : null}
                  {productTypes.map((c) => (
                    <SelectItem key={c.id} value={c.name}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="idiomas"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-xs">
              {t("dashboard.profile.hostProfile.languagesLabel")}
            </FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-9 w-full justify-between font-normal text-sm px-3"
                  >
                    <span className="truncate text-left">
                      {field.value.length
                        ? field.value.join(", ")
                        : t("dashboard.profile.hostProfile.languagesPlaceholder")}
                    </span>
                    <ChevronDown className="h-4 w-4 shrink-0 opacity-60" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent
                align="start"
                className="w-[min(100%,var(--radix-popover-trigger-width))] p-2"
              >
                <div className="flex flex-col gap-0.5">
                  {HOST_PROFILE_LANGUAGES.map((l) => {
                    const checked = field.value.some(
                      (x) => x.toLowerCase() === l.label.toLowerCase(),
                    );
                    return (
                      <label
                        key={l.code}
                        className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-2 text-sm hover:bg-accent"
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(c) => {
                            if (c === true) {
                              field.onChange([...field.value, l.label]);
                            } else {
                              if (field.value.length <= 1) return;
                              field.onChange(
                                field.value.filter(
                                  (x) =>
                                    x.toLowerCase() !== l.label.toLowerCase(),
                                ),
                              );
                            }
                          }}
                        />
                        <span aria-hidden>{l.flag}</span>
                        <span>{l.label}</span>
                      </label>
                    );
                  })}
                </div>
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )}
      />

      {!hideSubmitButton ? (
        <div className="flex flex-wrap gap-2 pt-1">
          <Button
            type="submit"
            size="sm"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("dashboard.profile.hostProfile.saving")}
              </>
            ) : (
              t("dashboard.profile.hostProfile.save")
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={form.formState.isSubmitting}
            onClick={() =>
              loadedProfile && form.reset(profileToFormValues(loadedProfile))
            }
          >
            {t("dashboard.profile.hostProfile.undo")}
          </Button>
        </div>
      ) : null}
    </>
  );

  const formBody = (
    <Form {...form}>
      {hideSubmitButton ? (
        <div className="space-y-3 max-w-full">{fieldsInner}</div>
      ) : (
        <form
          onSubmit={form.handleSubmit(onSubmitHostOnly)}
          className="space-y-3 max-w-full"
        >
          {fieldsInner}
        </form>
      )}
    </Form>
  );

  if (embedded) {
    return (
      <div className="space-y-3">
        <div className="space-y-1.5">
          <h3 className="text-lg md:text-xl font-semibold leading-none tracking-tight">
            {t("dashboard.profile.hostProfile.title")}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t("dashboard.profile.hostProfile.subtitleEmbedded")}
          </p>
        </div>
        {formBody}
      </div>
    );
  }

  return (
    <Card className="mt-8">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">
          {t("dashboard.profile.hostProfile.title")}
        </CardTitle>
        <CardDescription>
          {t("dashboard.profile.hostProfile.subtitleCard")}
        </CardDescription>
      </CardHeader>
      <CardContent>{formBody}</CardContent>
    </Card>
  );
});

HostProfileEditForm.displayName = "HostProfileEditForm";

export default HostProfileEditForm;
