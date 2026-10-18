import {
  validateCardNumber,
  validateExpiryDate,
  validateCVC,
  isTestCard,
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
    .optional()
    .refine((val) => !val || z.string().email().safeParse(val).success, {
      message: "Por favor ingresa un correo electrónico válido.",
    }),
  phone: z
    .string()
    .min(8, { message: "Por favor ingresa un número de teléfono válido." }),
});

export const shippingInfoSchema = z.object({
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().optional(),
});

export const creditCardSchema = z.object({
  cardNumber: z
    .string()
    .refine((val) => val.replace(/\D/g, "").length === 16, {
      message: "El número de tarjeta debe tener exactamente 16 dígitos",
    })
    .refine(validateCardNumber, "Número de tarjeta inválido")
    .refine((val) => !isTestCard(val), {
      message: "Este número de tarjeta no es válido para pagos reales",
    }),

  cardName: z
    .string()
    .min(3, "Por favor ingrese el nombre completo")
    .max(100, "El nombre es demasiado largo"),

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
  paymentMethod: z.enum(["credit", "blink", "paypal", "wompi", "googlepay"]),
});

// Esquema base: todos los campos opcionales/permisivos para que superRefine decida
const checkoutFormSchemaBase = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().optional(),
  phone: z.string(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().optional(),
  paymentMethod: z.enum(["credit", "blink", "paypal", "wompi", "googlepay"]),
  cardNumber: z.string().optional(),
  cardName: z.string().optional(),
  cardExpiry: z.string().optional(),
  cardCvc: z.string().optional(),
});

// Validación condicional: solo exigir lo que corresponde al método de pago
export const checkoutFormSchema = checkoutFormSchemaBase.superRefine(
  (data, ctx) => {
    const isBlink = data.paymentMethod === "blink";
    const isCredit = data.paymentMethod === "credit";

    // Contacto: siempre nombre, apellido y teléfono (para todos los métodos)
    if ((data.firstName?.trim() ?? "").length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "El nombre debe tener al menos 2 caracteres.",
        path: ["firstName"],
      });
    }
    if ((data.lastName?.trim() ?? "").length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "El apellido debe tener al menos 2 caracteres.",
        path: ["lastName"],
      });
    }
    if ((data.phone?.replace(/\D/g, "") ?? "").length < 8) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Por favor ingresa un número de teléfono válido.",
        path: ["phone"],
      });
    }

    // Con Bitcoin no se valida nada más
    if (isBlink) return;

    // Tarjeta: exige email y dirección
    if (isCredit) {
      const email = (data.email ?? "").trim();
      if (!email || !z.string().email().safeParse(email).success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Por favor ingresa un correo electrónico válido.",
          path: ["email"],
        });
      }
      if (
        !data.cardNumber?.replace(/\D/g, "") ||
        data.cardNumber.replace(/\D/g, "").length !== 16
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "El número de tarjeta debe tener exactamente 16 dígitos",
          path: ["cardNumber"],
        });
      } else if (!validateCardNumber(data.cardNumber)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Número de tarjeta inválido",
          path: ["cardNumber"],
        });
      } else if (isTestCard(data.cardNumber)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Este número de tarjeta no es válido para pagos reales",
          path: ["cardNumber"],
        });
      }
      if ((data.cardName?.trim() ?? "").length < 3) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Por favor ingrese el nombre completo",
          path: ["cardName"],
        });
      }
      if (!data.cardExpiry || data.cardExpiry.length !== 5 || !validateExpiryDate(data.cardExpiry)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Fecha de expiración inválida o vencida",
          path: ["cardExpiry"],
        });
      }
      if (!data.cardCvc || data.cardCvc.length < 3 || !validateCVC(data.cardCvc)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "CVC inválido",
          path: ["cardCvc"],
        });
      }
    }

    // Dirección: solo cuando no es blink
    if (!isBlink) {
      if ((data.address?.trim() ?? "").length < 5) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "La dirección debe tener al menos 5 caracteres.",
          path: ["address"],
        });
      }
      if ((data.country?.trim() ?? "").length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Por favor selecciona un país.",
          path: ["country"],
        });
      }
      if ((data.state?.trim() ?? "").length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Por favor selecciona una región.",
          path: ["state"],
        });
      }
      if ((data.city?.trim() ?? "").length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "La ciudad es obligatoria.",
          path: ["city"],
        });
      }
      if ((data.zipCode?.trim() ?? "").length < 3) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "El código postal es obligatorio.",
          path: ["zipCode"],
        });
      }
    }
  }
);

export type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;
