"use client"

import type { ReactNode } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface ReusableDialogProps {
  trigger: ReactNode
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  className?: string
}

export function ReusableDialog({
  trigger,
  title,
  description,
  children,
  footer,
  open,
  onOpenChange,
  className = "sm:max-w-[425px] max-w-[95%] md:max-w-[85%] lg:max-w-[75%] xl:max-w-[65%] p-0 overflow-hidden rounded-xl border-none shadow-xl",
}: ReusableDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className={className}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div className="py-4">{children}</div>
        {footer && <DialogFooter>{footer}</DialogFooter>}
      </DialogContent>
    </Dialog>
  )
}
