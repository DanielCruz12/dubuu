"use client"

import type React from "react"

import { useAuth } from "@clerk/nextjs"
import { useEffect } from "react"
import { useDispatch } from "react-redux"
import { clearToken, setToken } from "@/redux/slices/auth/auth-slice"

// Este componente se encarga de sincronizar el token de Clerk con Redux
export default function ClerkTokenProvider({ children }: { children: React.ReactNode }) {
  const { getToken, isSignedIn } = useAuth()
  const dispatch = useDispatch()

  useEffect(() => {
    // Función para actualizar el token en Redux
    const updateToken = async () => {
      if (isSignedIn) {
        try {
          const token = await getToken()
          dispatch(setToken(token))
        } catch (error) {
          console.error("Error al obtener el token:", error)
          dispatch(clearToken())
        }
      } else {
        dispatch(clearToken())
      }
    }

    // Actualizamos el token inmediatamente
    updateToken()

    // Configuramos un intervalo para refrescar el token periódicamente
    // (los tokens de Clerk pueden expirar)
    const intervalId = setInterval(updateToken, 10 * 60 * 1000) // cada 10 minutos

    return () => clearInterval(intervalId)
  }, [getToken, isSignedIn, dispatch])

  return <>{children}</>
}
