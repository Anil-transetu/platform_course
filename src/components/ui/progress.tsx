<<<<<<< HEAD
"use client"

import * as React from "react"
import { Progress as ProgressPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function Progress({
  className,
  value,
  indicatorClassName,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root> & { indicatorClassName?: string }) {
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        "relative flex h-1 w-full items-center overflow-x-hidden rounded-full bg-muted",
=======
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
>>>>>>> d02bf19c3bd1a348437e5c29da4bc8e1e13f0700
        className
      )}
      {...props}
    >
<<<<<<< HEAD
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className={cn("size-full flex-1 bg-primary transition-all", indicatorClassName)}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  )
}

export { Progress }
=======
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
>>>>>>> d02bf19c3bd1a348437e5c29da4bc8e1e13f0700
