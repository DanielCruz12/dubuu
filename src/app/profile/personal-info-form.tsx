"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
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
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const personalInfoSchema = z.object({
  firstName: z.string().min(2, {
    message: "First name must be at least 2 characters.",
  }),
  lastName: z.string().min(2, {
    message: "Last name must be at least 2 characters.",
  }),
  username: z.string().min(3, {
    message: "Username must be at least 3 characters.",
  }),
});

type PersonalInfoValues = z.infer<typeof personalInfoSchema>;

export default function PersonalInfoForm() {
  const { user, isLoaded } = useUser();
  const [isUpdating, setIsUpdating] = useState(false);

  const form = useForm<PersonalInfoValues>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      username: user?.username || "",
    },
  });

  async function onSubmit(data: PersonalInfoValues) {
    if (!user) return;

    setIsUpdating(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (user as any).update({
        firstName: data.firstName,
        lastName: data.lastName,
        username: data.username,
      });

      toast.success("¡Perfil actualizado!", {
        description: "Tu información personal ha sido actualizada",
      });
    } catch (error) {
      console.error(error);
      toast.error("Error al actualizar información", {
        description: "Hubo un error actualizando tu información.",
      });
    } finally {
      setIsUpdating(false);
    }
  }

  if (!isLoaded) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Información personal</h3>
        <p className="text-sm text-muted-foreground">
          Actualiza tu información.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="John" {...field} />
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
                    <Input placeholder="Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre de usuario</FormLabel>
                <FormControl>
                  <Input placeholder="johndoe" {...field} />
                </FormControl>
                <FormDescription>Este es su nombre público.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isUpdating}>
            {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Guardar cambios
          </Button>
        </form>
      </Form>
    </div>
  );
}
