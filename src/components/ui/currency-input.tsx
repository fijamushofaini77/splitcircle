"use client";

import { forwardRef } from "react";
import { Input } from "@/components/ui/input";

function formatNumber(value: string) {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  return Number(digits).toLocaleString("id-ID");
}

export function unformatNumber(value: string): number {
  const digits = value.replace(/\D/g, "");
  return digits ? Number(digits) : 0;
}

type CurrencyInputProps = {
  value: string;
  onValueChange: (raw: string, formatted: string) => void;
  placeholder?: string;
  required?: boolean;
};

export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ value, onValueChange, placeholder, required }, ref) => {
    return (
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
          Rp
        </span>
        <Input
          ref={ref}
          inputMode="numeric"
          className="pl-9"
          value={formatNumber(value)}
          placeholder={placeholder}
          required={required}
          onChange={(e) => {
            const raw = e.target.value.replace(/\D/g, "");
            onValueChange(raw, formatNumber(raw));
          }}
        />
      </div>
    );
  }
);
CurrencyInput.displayName = "CurrencyInput";
