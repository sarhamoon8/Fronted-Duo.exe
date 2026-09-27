import { forwardRef, useId, type InputHTMLAttributes, type SelectHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/presentation/lib/cn";

const BASE =
  "w-full min-h-[50px] rounded-xl border border-borde bg-superficie px-3.5 text-sm text-tinta " +
  "placeholder:text-tinta-tenue focus-visible:border-2 focus-visible:border-cerceta aria-[invalid=true]:border-peligro";

interface CampoProps {
  etiqueta: string;
  ayuda?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, CampoProps & InputHTMLAttributes<HTMLInputElement>>(
  function Input({ etiqueta, ayuda, error, className, id, ...props }, ref) {
    const autoId = useId();
    const inputId = id ?? autoId;
    return (
      <Envoltura etiqueta={etiqueta} ayuda={ayuda} error={error} htmlFor={inputId}>
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={descripcion(inputId, ayuda, error)}
          className={cn(BASE, className)}
          {...props}
        />
      </Envoltura>
    );
  },
);

export const Select = forwardRef<
  HTMLSelectElement,
  CampoProps & SelectHTMLAttributes<HTMLSelectElement> & { children: ReactNode }
>(function Select({ etiqueta, ayuda, error, className, id, children, ...props }, ref) {
  const autoId = useId();
  const selectId = id ?? autoId;
  return (
    <Envoltura etiqueta={etiqueta} ayuda={ayuda} error={error} htmlFor={selectId}>
      <select
        ref={ref}
        id={selectId}
        aria-invalid={error ? true : undefined}
        aria-describedby={descripcion(selectId, ayuda, error)}
        className={cn(BASE, "pr-8", className)}
        {...props}
      >
        {children}
      </select>
    </Envoltura>
  );
});

function descripcion(id: string, ayuda?: string, error?: string) {
  return [ayuda && `${id}-ayuda`, error && `${id}-error`].filter(Boolean).join(" ") || undefined;
}

function Envoltura({
  etiqueta,
  ayuda,
  error,
  htmlFor,
  children,
}: CampoProps & { htmlFor: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-[13px] text-tinta">
        {etiqueta}
      </label>
      {children}
      {ayuda && (
        <p id={`${htmlFor}-ayuda`} className="text-sm text-tinta-suave">
          {ayuda}
        </p>
      )}
      {error && (
        <p id={`${htmlFor}-error`} className="text-sm font-medium text-peligro">
          {error}
        </p>
      )}
    </div>
  );
}
