import {
  validateCardNumber,
  validateExpiryDate,
  validateCVC,
} from "@/components/sections/checkout/card-validation";
import { z } from "zod";

// Esquema de validación para el formulario de checkout
export const contactInfoSchema = z.object({
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
    .min(8, { message: "Por favor ingresa un número de teléfono válido." }),
});

export const shippingInfoSchema = z.object({
  address: z
    .string()
    .min(5, { message: "La dirección debe tener al menos 5 caracteres." })
    .max(50, { message: "La dirección no puede tener más de 50 caracteres." }),
  city: z
    .string()
    .min(2, { message: "La ciudad debe tener al menos 2 caracteres." })
    .optional(),
  state: z.string().min(2, { message: "Por favor selecciona una región." }),
  zipCode: z.string().optional(),
  country: z.string().min(2, { message: "Por favor selecciona un país." }),
});

export const creditCardSchema = z.object({
  cardNumber: z
    .string()
    .min(13, "El número de tarjeta es demasiado corto")
    .max(19, "El número de tarjeta es demasiado largo")
    .refine(validateCardNumber, "Número de tarjeta inválido"),
  cardName: z.string().min(4, {
    message: "Por favor ingresa el nombre completo como aparece en la tarjeta.",
  }),
  cardExpiry: z
    .string()
    .length(5, "Formato debe ser MM/YY")
    .refine(validateExpiryDate, "Fecha de expiración inválida o vencida"),

  cardCvc: z
    .string()
    .min(3, "CVC debe tener al menos 3 dígitos")
    .max(4, "CVC no puede tener más de 4 dígitos")
    .refine(validateCVC, "CVC inválido"),
});

export const paymentMethodSchema = z.object({
  paymentMethod: z.enum(["credit", "paypal", "wompi", "googlepay"]),
});

// Esquema completo que combina todos los esquemas anteriores
export const checkoutFormSchema = z
  .object({
    ...contactInfoSchema.shape,
    ...shippingInfoSchema.shape,
    ...paymentMethodSchema.shape,
    // Campos de tarjeta de crédito opcionales dependiendo del método de pago
    ...creditCardSchema.partial().shape,
  })
  .refine((data) => {
    // Si el método de pago es tarjeta de crédito, los campos de tarjeta son obligatorios
    if (data.paymentMethod === "credit") {
      return (
        !!data.cardNumber &&
        !!data.cardName &&
        !!data.cardExpiry &&
        !!data.cardCvc
      );
    }
    return true;
  });

export type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;
