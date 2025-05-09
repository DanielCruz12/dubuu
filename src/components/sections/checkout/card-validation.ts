// Credit card validation utilities

// Validates card number using Luhn algorithm
export function validateCardNumber(number: string): boolean {
  const digits = number.replace(/\D/g, "");

  if (digits.length < 13 || digits.length > 19) {
    return false;
  }

  // Luhn algorithm implementation
  let sum = 0;
  let shouldDouble = false;

  // Loop from right to left
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = Number.parseInt(digits.charAt(i));

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}

// Validates expiry date (must be future date)
export function validateExpiryDate(value: string): boolean {
  if (!value || value.length !== 5) return false;

  const [monthStr, yearStr] = value.split("/");
  if (!monthStr || !yearStr) return false;

  const month = Number.parseInt(monthStr, 10);
  const year = Number.parseInt("20" + yearStr, 10);

  // Check if month is valid
  if (month < 1 || month > 12) return false;

  const now = new Date();
  const currentMonth = now.getMonth() + 1; // getMonth() is 0-indexed
  const currentYear = now.getFullYear();

  // Check if date is in the future
  return year > currentYear || (year === currentYear && month >= currentMonth);
}

// Validates CVC code
export function validateCVC(cvc: string): boolean {
  const digits = cvc.replace(/\D/g, "");
  return digits.length >= 3 && digits.length <= 4;
}

// Format credit card number with spaces
export function formatCreditCardNumber(value: string): string {
  if (!value) return value;
  const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
  const matches = v.match(/\d{1,4}/g);

  if (!matches) return value;
  return matches.join(" ");
}

// Format expiry date with slash
export function formatExpiryDate(value: string): string {
  if (!value) return value;
  const v = value.replace(/\D/g, "");

  if (v.length >= 2) {
    return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
  }

  return v;
}

// Identify card type based on number
export function getCardType(number: string): string {
  const cleanNumber = number.replace(/\D/g, "");

  // Common card type patterns
  const patterns = {
    visa: /^4/,
    mastercard: /^5[1-5]/,
    amex: /^3[47]/,
    discover: /^6(?:011|5)/,
    diners: /^3(?:0[0-5]|[68])/,
    jcb: /^(?:2131|1800|35)/,
  };

  for (const [type, pattern] of Object.entries(patterns)) {
    if (pattern.test(cleanNumber)) {
      return type;
    }
  }

  return "unknown";
}

export const TEST_CARD_NUMBERS = [
  "4242424242424242", // Visa (Stripe test card)
  "4000056655665556", // Visa (Stripe test card)
  "5555555555554444", // Mastercard (Stripe test card)
  "2223003122003222", // Mastercard (Stripe test card)
  "5105105105105100", // Mastercard
  "378282246310005", // American Express
  "371449635398431", // American Express
  "6011111111111117", // Discover
  "6011000990139424", // Discover
  "3056930009020004", // Diners Club
  "36227206271667", // Diners Club
  "3566002020360505", // JCB
  "6200000000000005", // UnionPay
  // Añade más números de prueba según sea necesario
];

// Verifica si es un número de tarjeta de prueba
export function isTestCard(number: string): boolean {
  const cleanNumber = number.replace(/\D/g, "");
  return TEST_CARD_NUMBERS.includes(cleanNumber);
}
