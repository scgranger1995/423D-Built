"use client";

import React, { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes, type SelectHTMLAttributes } from "react";

/* ------------------------------------------------------------------ */
/*  Shared wrapper styles                                              */
/* ------------------------------------------------------------------ */

const baseFieldStyles =
  "w-full rounded-lg px-4 py-3 text-off-white placeholder-gray-500 transition-all duration-200 focus:outline-none";

const fieldInline: React.CSSProperties = {
  backgroundColor: "#1a1a1a",
  border: "1px solid #333333",
  color: "#F5F5F5",
};

const focusRing =
  "focus:ring-2 focus:ring-offset-0";

/* ------------------------------------------------------------------ */
/*  Label                                                              */
/* ------------------------------------------------------------------ */

function FieldLabel({ label, htmlFor }: { label?: string; htmlFor?: string }) {
  if (!label) return null;
  return (
    <label
      htmlFor={htmlFor}
      className="block text-sm font-medium mb-1.5"
      style={{ color: "#D4881C" }}
    >
      {label}
    </label>
  );
}

/* ------------------------------------------------------------------ */
/*  Error message                                                      */
/* ------------------------------------------------------------------ */

function FieldError({ error }: { error?: string }) {
  if (!error) return null;
  return <p className="mt-1 text-sm text-red-400">{error}</p>;
}

/* ------------------------------------------------------------------ */
/*  Input                                                              */
/* ------------------------------------------------------------------ */

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, id, className = "", style, ...rest }, ref) => {
    const fieldId = id || rest.name;
    return (
      <div className="w-full">
        <FieldLabel label={label} htmlFor={fieldId} />
        <input
          ref={ref}
          id={fieldId}
          className={`${baseFieldStyles} ${focusRing} ${error ? "ring-2 ring-red-500" : ""} ${className}`}
          style={{
            ...fieldInline,
            ...(style ?? {}),
            // CSS custom property for focus colour applied via focus: variant
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "#D4881C";
            e.currentTarget.style.boxShadow = "0 0 0 2px rgba(212,136,28,0.25)";
            rest.onFocus?.(e);
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = error ? "#ef4444" : "#333333";
            e.currentTarget.style.boxShadow = "none";
            rest.onBlur?.(e);
          }}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={error ? `${fieldId}-error` : undefined}
          {...rest}
        />
        {error && (
          <p id={`${fieldId}-error`} className="mt-1 text-sm text-red-400">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

/* ------------------------------------------------------------------ */
/*  Textarea                                                           */
/* ------------------------------------------------------------------ */

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, id, className = "", style, ...rest }, ref) => {
    const fieldId = id || rest.name;
    return (
      <div className="w-full">
        <FieldLabel label={label} htmlFor={fieldId} />
        <textarea
          ref={ref}
          id={fieldId}
          rows={rest.rows ?? 4}
          className={`${baseFieldStyles} ${focusRing} resize-y min-h-[100px] ${error ? "ring-2 ring-red-500" : ""} ${className}`}
          style={{
            ...fieldInline,
            ...(style ?? {}),
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "#D4881C";
            e.currentTarget.style.boxShadow = "0 0 0 2px rgba(212,136,28,0.25)";
            rest.onFocus?.(e);
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = error ? "#ef4444" : "#333333";
            e.currentTarget.style.boxShadow = "none";
            rest.onBlur?.(e);
          }}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={error ? `${fieldId}-error` : undefined}
          {...rest}
        />
        <FieldError error={error} />
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

/* ------------------------------------------------------------------ */
/*  Select                                                             */
/* ------------------------------------------------------------------ */

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string; disabled?: boolean }[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, id, options, placeholder, className = "", style, ...rest }, ref) => {
    const fieldId = id || rest.name;
    return (
      <div className="w-full">
        <FieldLabel label={label} htmlFor={fieldId} />
        <select
          ref={ref}
          id={fieldId}
          className={`${baseFieldStyles} ${focusRing} appearance-none cursor-pointer ${error ? "ring-2 ring-red-500" : ""} ${className}`}
          style={{
            ...fieldInline,
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%23D4881C' viewBox='0 0 16 16'%3E%3Cpath d='M4.646 5.646a.5.5 0 0 1 .708 0L8 8.293l2.646-2.647a.5.5 0 0 1 .708.708l-3 3a.5.5 0 0 1-.708 0l-3-3a.5.5 0 0 1 0-.708z'/%3E%3C/svg%3E")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 12px center",
            backgroundSize: "16px",
            paddingRight: "40px",
            ...(style ?? {}),
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "#D4881C";
            e.currentTarget.style.boxShadow = "0 0 0 2px rgba(212,136,28,0.25)";
            rest.onFocus?.(e);
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = error ? "#ef4444" : "#333333";
            e.currentTarget.style.boxShadow = "none";
            rest.onBlur?.(e);
          }}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={error ? `${fieldId}-error` : undefined}
          {...rest}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>
        <FieldError error={error} />
      </div>
    );
  }
);

Select.displayName = "Select";
