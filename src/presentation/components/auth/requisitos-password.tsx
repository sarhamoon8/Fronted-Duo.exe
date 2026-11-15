import { Check } from "lucide-react";
import { REGLAS_PASSWORD } from "@/core/domain/password";
import { cn } from "@/presentation/lib/cn";

/** Lista "Debe contener al menos:" — cada requisito se marca al cumplirse mientras la persona escribe. */
export function RequisitosPassword({ password, id }: { password: string; id: string }) {
  return (
    <div id={id}>
      <p className="text-[13px] font-semibold text-tinta">Debe contener al menos:</p>
      <ul className="mt-1.5 flex flex-col gap-1">
        {REGLAS_PASSWORD.map((regla) => {
          const cumple = regla.cumple(password);
          return (
            <li key={regla.id} className={cn("flex items-center gap-2 text-[13px]", cumple ? "text-esmeralda-profundo" : "text-tinta-suave")}>
              <span aria-hidden="true" className="flex size-4 shrink-0 items-center justify-center">
                {cumple ? <Check className="size-4" strokeWidth={2.5} /> : <span className="size-1.5 rounded-full bg-tinta-tenue" />}
              </span>
              {regla.texto}
              <span className="sr-only">{cumple ? " (cumplido)" : " (pendiente)"}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
