"use client";

import { useState, useEffect } from "react";

interface GeolocationState {
  country: string | null;
  isLoading: boolean;
  error: string | null;
  hasPermission: boolean | null;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    country: null,
    isLoading: false,
    error: null,
    hasPermission: null,
  });

  const requestLocation = async () => {
    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        error: "Geolocalización no soportada en este navegador",
        hasPermission: false,
      }));
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000, // 5 minutos
          });
        }
      );

      // Usar un servicio de geocodificación inversa para obtener el país
      const { latitude, longitude } = position.coords;

      try {
        // Usando un servicio gratuito para obtener información del país
        const response = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=es`
        );

        if (!response.ok) {
          throw new Error("Error al obtener información de ubicación");
        }

        const data = await response.json();
        const country = data.countryName || data.country;

        setState((prev) => ({
          ...prev,
          country,
          isLoading: false,
          hasPermission: true,
        }));

        // Guardar en localStorage para uso futuro
        localStorage.setItem("userCountry", country);
      } catch (geocodeError) {
        console.error("Error en geocodificación:", geocodeError);
        setState((prev) => ({
          ...prev,
          error: "Error al obtener información del país",
          isLoading: false,
          hasPermission: true,
        }));
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      let errorMessage = "Error al obtener ubicación";

      if (error.code === 1) {
        errorMessage = "Permiso de ubicación denegado";
        setState((prev) => ({ ...prev, hasPermission: false }));
      } else if (error.code === 2) {
        errorMessage = "Ubicación no disponible";
      } else if (error.code === 3) {
        errorMessage = "Tiempo de espera agotado";
      }

      setState((prev) => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
      }));
    }
  };

  // Verificar si ya tenemos el país guardado
  useEffect(() => {
    const savedCountry = localStorage.getItem("userCountry");
    if (savedCountry) {
      setState((prev) => ({
        ...prev,
        country: savedCountry,
        hasPermission: true,
      }));
    }
  }, []);

  const clearLocation = () => {
    localStorage.removeItem("userCountry");
    setState({
      country: null,
      isLoading: false,
      error: null,
      hasPermission: null,
    });
  };

  return {
    ...state,
    requestLocation,
    clearLocation,
  };
}
