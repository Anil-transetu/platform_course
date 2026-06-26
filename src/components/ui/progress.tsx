import * as React from "react"
import { cn } from "@/lib/utils"
import { Field, FieldLabel } from "@/components/ui/field"

interface ProgressProps extends React.ComponentProps<"div"> {
  value?: number
  indicatorClassName?: string
}

export function Progress({
  className,
  value = 0,
  indicatorClassName,
  ...props
}: ProgressProps) {
  return (
    <div
      data-slot="progress"
      className={cn(
        "relative h-1.5 w-full overflow-hidden rounded-full bg-slate-100",
        className
      )}
      {...props}
    >
      <div
        className={cn("h-full w-full transition-all rounded-full bg-primary", indicatorClassName)}
        style={{ width: `${value || 0}%` }}
      />
    </div>
  )
}

interface ProgressWithLabelProps {
  value: number
  label?: string
  id?: string
  className?: string
  indicatorClassName?: string
  labelClassName?: string
  valueClassName?: string
}

export function ProgressWithLabel({
  value = 66,
  label = "Upload progress",
  id = "progress-upload",
  className,
  indicatorClassName,
  labelClassName,
  valueClassName,
}: ProgressWithLabelProps) {
  return (
    <Field className={cn("w-full max-w-sm", className)}>
      <FieldLabel htmlFor={id} className={labelClassName}>
        <span>{label}</span>
        <span className={cn("ml-auto text-blue-600", valueClassName)}>{value}%</span>
      </FieldLabel>
      <Progress value={value} id={id} indicatorClassName={indicatorClassName} />
    </Field>
  )
}
