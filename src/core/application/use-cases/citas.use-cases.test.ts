import { describe, expect, it, vi } from "vitest";
import { AppError } from "../../domain/errors";
import type { CitaRepository, ProfesionalRepository } from "../../domain/ports";
import {
  AgendarCitaUseCase,
  CancelarCitaUseCase,
  ConsultarDisponibilidadCitasUseCase,
  ListarProfesionalesUseCase,
  MisCitasUseCase,
} from "./citas.use-cases";

const repo = (): CitaRepository => ({ disponibilidad: vi.fn(), agendar: vi.fn(), misCitas: vi.fn(), cancelar: vi.fn() });

describe("casos de uso de citas", () => {
  it("consultar disponibilidad valida sede, especialidad y fecha", () => {
    const r = repo();
    const caso = new ConsultarDisponibilidadCitasUseCase(r);
    expect(() => caso.ejecutar("", "Cardiología", "2026-11-17")).toThrow(AppError);
    expect(() => caso.ejecutar("p1", "", "2026-11-17")).toThrow(AppError);
    expect(() => caso.ejecutar("p1", "Cardiología", "17/11/2026")).toThrow(AppError);
    expect(r.disponibilidad).not.toHaveBeenCalled();

    caso.ejecutar("p1", "Cardiología", "2026-11-17");
    expect(r.disponibilidad).toHaveBeenCalledWith("p1", "Cardiología", "2026-11-17");
  });

  it("agendar exige sede, especialidad y hora, y delega en el repositorio", () => {
    const r = repo();
    const caso = new AgendarCitaUseCase(r);
    expect(() => caso.ejecutar({ puntoId: "p1", especialidad: "Pediatría", fechaHora: "" })).toThrow(AppError);
    expect(r.agendar).not.toHaveBeenCalled();

    const datos = { puntoId: "p1", especialidad: "Pediatría", fechaHora: "2026-11-17T14:00:00.000Z" };
    caso.ejecutar(datos);
    expect(r.agendar).toHaveBeenCalledWith(datos);
  });

  it("mis citas, cancelar y listar profesionales delegan", () => {
    const r = repo();
    new MisCitasUseCase(r).ejecutar();
    new CancelarCitaUseCase(r).ejecutar("c1");
    const profesionales: ProfesionalRepository = { listar: vi.fn() };
    new ListarProfesionalesUseCase(profesionales).ejecutar({ puntoId: "p1" });

    expect(r.misCitas).toHaveBeenCalled();
    expect(r.cancelar).toHaveBeenCalledWith("c1");
    expect(profesionales.listar).toHaveBeenCalledWith({ puntoId: "p1" });
  });
});
