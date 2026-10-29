import { describe, expect, it, vi } from "vitest";
import type { TurnoRepository } from "../../domain/ports";
import type { Turno } from "../../domain/entities/turno";
import { AppError } from "../../domain/errors";
import {
  AvanzarTurnoUseCase,
  CancelarTurnoUseCase,
  ConsultarFilaUseCase,
  MisTurnosUseCase,
  SolicitarTurnoUseCase,
} from "./turnos.use-cases";

function crearRepoFalso(overrides: Partial<TurnoRepository> = {}): TurnoRepository {
  return {
    solicitar: vi.fn(),
    cancelar: vi.fn(),
    avanzar: vi.fn(),
    listarPorPunto: vi.fn(),
    misTurnos: vi.fn(),
    ...overrides,
  };
}

function crearTurno(overrides: Partial<Turno> = {}): Turno {
  return {
    id: "turno-1",
    usuarioId: "usuario-1",
    servicioId: "servicio-1",
    puntoId: "punto-1",
    ventanillaId: null,
    codigoAlfanumerico: "T-ABC123",
    estado: "PENDIENTE",
    prioridad: false,
    posicion: 1,
    horaLlamado: null,
    horaFinalizacion: null,
    creadoEn: new Date(),
    ...overrides,
  };
}

describe("SolicitarTurnoUseCase", () => {
  it("rechaza sin servicioId o puntoId, sin llamar al repositorio", async () => {
    const repo = crearRepoFalso();
    const useCase = new SolicitarTurnoUseCase(repo);

    expect(() => useCase.ejecutar("", "punto-1")).toThrow(AppError);
    expect(repo.solicitar).not.toHaveBeenCalled();
  });

  it("delega en turnoRepository.solicitar con datos válidos", () => {
    const repo = crearRepoFalso();
    const useCase = new SolicitarTurnoUseCase(repo);

    useCase.ejecutar("servicio-1", "punto-1");

    expect(repo.solicitar).toHaveBeenCalledWith("servicio-1", "punto-1");
  });
});

describe("CancelarTurnoUseCase", () => {
  it("rechaza cancelar un turno ATENDIDO (misma regla que el backend)", () => {
    const repo = crearRepoFalso();
    const useCase = new CancelarTurnoUseCase(repo);

    expect(() => useCase.ejecutar(crearTurno({ estado: "ATENDIDO" }))).toThrow(AppError);
    expect(repo.cancelar).not.toHaveBeenCalled();
  });

  it("permite cancelar un turno PENDIENTE", () => {
    const repo = crearRepoFalso();
    const useCase = new CancelarTurnoUseCase(repo);

    useCase.ejecutar(crearTurno({ id: "turno-9", estado: "PENDIENTE" }));

    expect(repo.cancelar).toHaveBeenCalledWith("turno-9");
  });
});

describe("AvanzarTurnoUseCase", () => {
  it("rechaza avanzar un turno ATENDIDO", () => {
    const repo = crearRepoFalso();
    const useCase = new AvanzarTurnoUseCase(repo);

    expect(() => useCase.ejecutar(crearTurno({ estado: "ATENDIDO" }))).toThrow(AppError);
  });

  it("exige ventanillaId para llamar un turno PENDIENTE", () => {
    const repo = crearRepoFalso();
    const useCase = new AvanzarTurnoUseCase(repo);

    expect(() => useCase.ejecutar(crearTurno({ estado: "PENDIENTE" }))).toThrow(AppError);
    expect(repo.avanzar).not.toHaveBeenCalled();
  });

  it("no exige ventanillaId para finalizar un turno EN_CURSO", () => {
    const repo = crearRepoFalso();
    const useCase = new AvanzarTurnoUseCase(repo);

    useCase.ejecutar(crearTurno({ id: "turno-2", estado: "EN_CURSO" }));

    expect(repo.avanzar).toHaveBeenCalledWith("turno-2", undefined);
  });

  it("pasa el ventanillaId cuando se llama un turno PENDIENTE", () => {
    const repo = crearRepoFalso();
    const useCase = new AvanzarTurnoUseCase(repo);

    useCase.ejecutar(crearTurno({ id: "turno-3", estado: "PENDIENTE" }), "ventanilla-1");

    expect(repo.avanzar).toHaveBeenCalledWith("turno-3", "ventanilla-1");
  });
});

describe("ConsultarFilaUseCase", () => {
  it("cuenta los turnos por estado y encuentra el siguiente PENDIENTE", async () => {
    const turnos = [
      crearTurno({ id: "t1", estado: "EN_CURSO" }),
      crearTurno({ id: "t2", estado: "PENDIENTE" }),
      crearTurno({ id: "t3", estado: "PENDIENTE" }),
      crearTurno({ id: "t4", estado: "CANCELADO" }),
    ];
    const repo = crearRepoFalso({ listarPorPunto: vi.fn().mockResolvedValue(turnos) });
    const useCase = new ConsultarFilaUseCase(repo);

    const resumen = await useCase.ejecutar("punto-1");

    expect(resumen.conteo).toEqual({ PENDIENTE: 2, EN_CURSO: 1, ATENDIDO: 0, CANCELADO: 1 });
    expect(resumen.siguiente?.id).toBe("t2");
  });

  it("siguiente es null cuando no hay ningún turno PENDIENTE", async () => {
    const repo = crearRepoFalso({
      listarPorPunto: vi.fn().mockResolvedValue([crearTurno({ estado: "ATENDIDO" })]),
    });
    const useCase = new ConsultarFilaUseCase(repo);

    const resumen = await useCase.ejecutar("punto-1");

    expect(resumen.siguiente).toBeNull();
  });
});

describe("MisTurnosUseCase", () => {
  it("delega en turnoRepository.misTurnos", async () => {
    const repo = crearRepoFalso({ misTurnos: vi.fn().mockResolvedValue([crearTurno()]) });
    const useCase = new MisTurnosUseCase(repo);

    await useCase.ejecutar();

    expect(repo.misTurnos).toHaveBeenCalledTimes(1);
  });
});
