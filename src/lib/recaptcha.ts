"use server";

/**
 * Verifica el token de reCAPTCHA directamente con Google
 * Esta función debe ejecutarse en el servidor para proteger la clave secreta
 */
export async function verifyRecaptcha(
  token: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!token) {
      return { success: false, error: "Token de reCAPTCHA no proporcionado" };
    }

    // Verifica el token de reCAPTCHA con Google
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;

    if (!secretKey) {
      console.error("RECAPTCHA_SECRET_KEY no está configurada");
      return { success: false, error: "Error de configuración del servidor" };
    }

    // Construir los parámetros para la solicitud
    const params = new URLSearchParams();
    params.append("secret", secretKey);
    params.append("response", token);

    // Realizar la solicitud a la API de Google
    const response = await fetch(
      "https://www.google.com/recaptcha/api/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      }
    );

    const data = await response.json();

    if (data.success) {
      return { success: true };
    } else {
      console.error("Error de verificación de reCAPTCHA:", data["error-codes"]);
      return {
        success: false,
        error: data["error-codes"]?.join(", ") || "Error de verificación",
      };
    }
  } catch (error) {
    console.error("Error al verificar reCAPTCHA:", error);
    return { success: false, error: "Error interno del servidor" };
  }
}
