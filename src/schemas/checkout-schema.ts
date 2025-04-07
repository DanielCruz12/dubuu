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
    .min(5, { message: "La dirección debe tener al menos 5 caracteres." }),
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
    .min(16, { message: "El número de tarjeta debe tener 16 dígitos." })
    .refine((val) => /^[0-9]{16}$/.test(val.replace(/\s/g, "")), {
      message: "Número de tarjeta inválido.",
    }),
  cardName: z
    .string()
    .min(4, {
      message:
        "Por favor ingresa el nombre completo como aparece en la tarjeta.",
    }),
  cardExpiry: z
    .string()
    .refine((val) => /^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(val), {
      message: "Formato de fecha inválido (MM/YY).",
    })
    .refine(
      (val) => {
        const [month, year] = val.split("/");
        const expiry = new Date();
        expiry.setFullYear(
          2000 + Number.parseInt(year),
          Number.parseInt(month) - 1,
          1
        );
        return expiry > new Date();
      },
      {
        message: "La tarjeta ha expirado.",
      }
    ),
  cardCvc: z
    .string()
    .min(3, { message: "El CVC debe tener al menos 3 dígitos." })
    .max(4, { message: "El CVC no puede tener más de 4 dígitos." })
    .refine((val) => /^[0-9]{3,4}$/.test(val), {
      message: "CVC inválido.",
    }),
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
