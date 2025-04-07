/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { forwardRef } from "react"
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input"
import { CheckCircle, XCircle } from "lucide-react"
import "react-phone-number-input/style.css"

interface PhoneInputProps {
  value: string
  onChange: (value: string | undefined) => void
  onBlur?: () => void
  defaultCountry?: any
  className?: string
  disabled?: boolean
}

export const PhoneInputComponent = forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ value, onChange, onBlur, defaultCountry = "SV" as any, className = "", disabled = false }, ref) => {
    return (
      <div className="relative">
        <PhoneInput
          international
          defaultCountry={defaultCountry}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          className="phone-input"
          inputComponent={CustomPhoneInputComponent}
        />
        {value && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {isValidPhoneNumber(value) ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500" />
            )}
          </div>
        )}
        {value && isValidPhoneNumber(value) && <p className="text-xs text-green-600 mt-1">Número válido</p>}
      </div>
    )
  },
)

PhoneInputComponent.displayName = "PhoneInputComponent"

// Componente personalizado para el input que se adapta al estilo de shadcn/ui
const CustomPhoneInputComponent = forwardRef<HTMLInputElement, any>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      {...props}
      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
    />
  )
})

CustomPhoneInputComponent.displayName = "CustomPhoneInputComponent"

