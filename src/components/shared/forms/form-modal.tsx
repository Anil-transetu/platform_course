"use client";

import React, { useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertCircle } from "lucide-react";

interface FormFieldConfig {
  name: string;
  label: string;
  type: "text" | "email" | "password" | "number" | "textarea" | "select";
  placeholder?: string;
  required?: boolean;
  options?: Array<{ value: string; label: string }>;
  description?: string;
}

interface CreateEditModalProps<T extends Record<string, unknown>> {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  mode?: "add" | "edit";
  initialData?: T | null;
  form: UseFormReturn<T>;
  fields: FormFieldConfig[];
  onSubmit: (data: T) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
}

/**
 * Reusable FormModal component for both Create and Edit operations
 * Automatically resets form when initialData or mode changes
 * Handles loading states and error displays
 */
export function CreateEditModal<T extends Record<string, unknown>>({
  isOpen,
  onClose,
  title,
  description,
  mode = "add",
  initialData,
  form,
  fields,
  onSubmit,
  isLoading = false,
  error,
}: CreateEditModalProps<T>) {
  // Reset form when modal opens/closes or data changes
  useEffect(() => {
    if (isOpen && initialData) {
      form.reset(initialData);
    } else if (isOpen && mode === "add") {
      form.reset();
    }
  }, [isOpen, initialData, mode, form]);

  const handleSubmit = async (data: T) => {
    try {
      await onSubmit(data);
      onClose();
    } catch (err) {
      console.error("Form submission error:", err);
    }
  };

  const isEdit = mode === "edit";
  const submitLabel = isEdit ? "Update" : "Create";
  const defaultTitle = isEdit ? `Edit ${title || "Item"}` : `Add ${title || "Item"}`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{title || defaultTitle}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        {error && (
          <div className="flex gap-3 rounded-md bg-red-50 p-3 border border-red-200">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            {fields.map((field) => (
              <FormField
                key={field.name}
                control={form.control}
                name={field.name as never}
                render={({ field: fieldProps }) => (
                  <FormItem>
                    <FormLabel>
                      {field.label}
                      {field.required && <span className="text-red-500">*</span>}
                    </FormLabel>
                    <FormControl>
                      {field.type === "textarea" ? (
                        <Textarea
                          placeholder={field.placeholder}
                          disabled={isLoading}
                          {...fieldProps}
                        />
                      ) : field.type === "select" ? (
                        <Select
                          value={String(fieldProps.value || "")}
                          onValueChange={fieldProps.onChange}
                          disabled={isLoading}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={field.placeholder} />
                          </SelectTrigger>
                          <SelectContent>
                            {field.options?.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          type={field.type}
                          placeholder={field.placeholder}
                          disabled={isLoading}
                          {...fieldProps}
                        />
                      )}
                    </FormControl>
                    {field.description && (
                      <p className="text-xs text-muted-foreground">{field.description}</p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}

            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && (
                  <span className="mr-2 h-4 w-4 animate-spin">⏳</span>
                )}
                {submitLabel}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
