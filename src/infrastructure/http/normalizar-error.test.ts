import { AxiosError, AxiosHeaders } from "axios";
import { describe, expect, it } from "vitest";
import { AppError } from "@/core/domain/errors";
import { normalizarError } from "./normalizar-error";

function crearAxiosError(status: number, data: unknown): AxiosError {
  return new AxiosError(
    "Request failed",
    "ERR_BAD_REQUEST",
    undefined,
    undefined,
    {
      status,
      statusText: "",
      headers: {},
      config: { headers: new AxiosHeaders() },
      data,
    },
  );
}

describe("normalizarError", () => {
  it("devuelve el mismo AppError si ya lo es, sin volver a envolverlo", () => {
    const original = new AppError(["ya normalizado"], 400);
    expect(normalizarError(original)).toBe(original);
  });

  it("usa el array `message` de NestJS tal cual (errores de ValidationPipe)", () => {
    const error = crearAxiosError(400, { message: ["campo A inválido", "campo B inválido"] });
    const resultado = normalizarError(error);

    expect(resultado.mensajes).toEqual(["campo A inválido", "campo B inválido"]);
    expect(resultado.status).toBe(400);
  });

  it("envuelve un `message` string de NestJS en un arreglo de un elemento", () => {
    const error = crearAxiosError(404, { message: "Turno no encontrado" });
    const resultado = normalizarError(error);

    expect(resultado.mensajes).toEqual(["Turno no encontrado"]);
  });

  it("usa un mensaje genérico por status cuando el backend no envía `message`", () => {
    const error = crearAxiosError(403, {});
    const resultado = normalizarError(error);

    expect(resultado.mensajes).toEqual(["No tienes permisos para realizar esta operación."]);
  });

  it("marca origen 'red' y status 0 cuando no hay respuesta del servidor (backend caído)", () => {
    const error = new AxiosError("Network Error", "ERR_NETWORK");
    const resultado = normalizarError(error);

    expect(resultado.status).toBe(0);
    expect(resultado.origen).toBe("red");
  });

  it("distingue el timeout (ECONNABORTED) con su propio mensaje", () => {
    const error = new AxiosError("timeout", "ECONNABORTED");
    const resultado = normalizarError(error);

    expect(resultado.mensajes).toEqual(["La solicitud tardó demasiado. Intenta de nuevo."]);
  });

  it("envuelve cualquier otro error desconocido", () => {
    const resultado = normalizarError(new Error("algo raro"));
    expect(resultado.mensajes).toEqual(["algo raro"]);
    expect(resultado.status).toBe(0);
  });
});
