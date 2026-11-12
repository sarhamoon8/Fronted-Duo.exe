import { describe, expect, it } from "vitest";
import { casosDeUso } from "./container";

describe("casosDeUso", () => {
  it("expone un caso de uso por cada operación de dominio", () => {
    const claves = [
      "iniciarSesion",
      "registrarse",
      "cerrarSesion",
      "listarEntidades",
      "listarServicios",
      "listarPuntos",
      "crearEntidad",
      "crearServicio",
      "listarVentanillas",
      "solicitarTurno",
      "cancelarTurno",
      "avanzarTurno",
      "consultarFila",
      "misTurnos",
      "listarUsuarios",
      "crearUsuario",
    ] as const;

    for (const clave of claves) {
      expect(casosDeUso[clave]).toBeDefined();
      expect(typeof casosDeUso[clave].ejecutar).toBe("function");
    }
  });
});
