import axios from "axios";
import { AppError } from "@/core/domain/errors";

interface NestErrorBody {
  message?: string | string[];
  error?: string;
  statusCode?: number;
}

const MENSAJE_POR_STATUS: Record<number, string> = {
  400: "Revisa los datos enviados.",
  401: "Tu sesión no es válida o expiró. Inicia sesión de nuevo.",
  403: "No tienes permisos para realizar esta operación.",
  404: "El recurso solicitado no existe.",
  409: "El recurso ya existe.",
  502: "No fue posible conectar con el servidor.",
};

/**
 * Traduce un error de Axios al AppError del dominio. Entiende el formato de
 * error de NestJS + ValidationPipe, donde `message` puede ser un arreglo.
 */
export function normalizarError(
  error: unknown,
  origen: "interna" = "interna",
): AppError {
  if (error instanceof AppError) return error;

  if (axios.isAxiosError(error)) {
    if (!error.response) {
      const msg =
        error.code === "ECONNABORTED"
          ? "La solicitud tardó demasiado. Intenta de nuevo."
          : "No hay conexión con el servidor. Revisa tu red e intenta de nuevo.";
      return new AppError([msg], 0, "red");
    }
    const { status, data } = error.response;
    const body = (typeof data === "object" && data !== null ? data : {}) as NestErrorBody;
    const crudo = body.message;
    const mensajes = Array.isArray(crudo)
      ? crudo
      : typeof crudo === "string" && crudo
        ? [crudo]
        : [MENSAJE_POR_STATUS[status] ?? `Error ${status}.`];
    return new AppError(mensajes, status, origen);
  }

  return new AppError(
    [error instanceof Error ? error.message : "Error inesperado."],
    0,
    origen,
  );
}
