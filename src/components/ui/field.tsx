import * as React from "react"
import { cn } from "@/lib/utils"

export function Field({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field"
      className={cn("flex flex-col gap-1 w-full", className)}
      {...props}
    />
  )
}

export function FieldLabel({
  className,
  ...props
}: React.ComponentProps<"label">) {
  return (
    <label
      data-slot="field-label"
      className={cn(
        "flex items-center text-xs font-semibold text-slate-500",
        className
      )}
      {...props}
    />
  )
}
