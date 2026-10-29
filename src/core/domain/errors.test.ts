import { describe, expect, it } from "vitest";
import { AppError, mensajeDeError } from "./errors";

describe("AppError", () => {
  it("une los mensajes con '. ' para el message de Error", () => {
    const error = new AppError(["Primero", "Segundo"], 400);
    expect(error.message).toBe("Primero. Segundo");
  });

  it("noAutorizado es true solo para status 401", () => {
    expect(new AppError(["x"], 401).noAutorizado).toBe(true);
    expect(new AppError(["x"], 403).noAutorizado).toBe(false);
  });

  it("prohibido es true solo para status 403", () => {
    expect(new AppError(["x"], 403).prohibido).toBe(true);
    expect(new AppError(["x"], 401).prohibido).toBe(false);
  });
});

describe("mensajeDeError", () => {
  it("devuelve el message de un AppError", () => {
    expect(mensajeDeError(new AppError(["algo salió mal"], 400))).toBe("algo salió mal");
  });

  it("devuelve el message de un Error genérico", () => {
    expect(mensajeDeError(new Error("boom"))).toBe("boom");
  });

  it("devuelve un mensaje genérico para cualquier otra cosa", () => {
    expect(mensajeDeError("string plano")).toBe("Ocurrió un error inesperado.");
    expect(mensajeDeError(null)).toBe("Ocurrió un error inesperado.");
  });
});
