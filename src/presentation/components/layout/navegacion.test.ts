import { describe, expect, it } from "vitest";
import { estaActivo, navegacionPara, NAVEGACION, PERFIL_ETIQUETA, INICIO_POR_ROL } from "./navegacion";

describe("navegacionPara", () => {
  it("devuelve el menú correcto para cada rol", () => {
    expect(navegacionPara("PACIENTE")).toBe(NAVEGACION.PACIENTE);
    expect(navegacionPara("FUNCIONARIO")).toBe(NAVEGACION.FUNCIONARIO);
    expect(navegacionPara("ADMIN")).toBe(NAVEGACION.ADMIN);
  });
});

describe("estaActivo", () => {
  it("coincide con rutas hijas cuando no es exacto", () => {
    const item = { href: "/turnos", etiqueta: "Mis turnos", icono: NAVEGACION.PACIENTE[0].icono };
    expect(estaActivo(item, "/turnos")).toBe(true);
    expect(estaActivo(item, "/turnos/123")).toBe(true);
    expect(estaActivo(item, "/otro")).toBe(false);
  });

  it("solo coincide con la ruta exacta cuando exacto=true", () => {
    const item = { href: "/fila", etiqueta: "Cola", icono: NAVEGACION.FUNCIONARIO[0].icono, exacto: true };
    expect(estaActivo(item, "/fila")).toBe(true);
    expect(estaActivo(item, "/fila/atendidos")).toBe(false);
  });
});

describe("PERFIL_ETIQUETA / INICIO_POR_ROL", () => {
  it("tiene una entrada por cada rol", () => {
    for (const rol of ["PACIENTE", "FUNCIONARIO", "ADMIN"] as const) {
      expect(PERFIL_ETIQUETA[rol]).toBeTruthy();
      expect(INICIO_POR_ROL[rol]).toBeTruthy();
    }
  });
});
