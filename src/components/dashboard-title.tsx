import type React from "react"

interface DashboardTitleProps {
  heading: string
  description?: string
  children?: React.ReactNode
}

export function DashboardTitle({ heading, description, children }: DashboardTitleProps) {
  return (
    <div className="flex flex-col items-start justify-between gap-4 border-b pb-5 sm:flex-row sm:items-center sm:gap-0">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">{heading}</h1>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {children}
    </div>
  )
}
