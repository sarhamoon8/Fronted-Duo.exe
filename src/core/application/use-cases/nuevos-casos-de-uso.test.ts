import { describe, expect, it, vi } from "vitest";
import { AppError } from "../../domain/errors";
import type { ListaEsperaRepository, MedicamentoRepository, NotificacionRepository } from "../../domain/ports";
import { MisInscripcionesEsperaUseCase, SalirListaEsperaUseCase, UnirseListaEsperaUseCase } from "./lista-espera.use-cases";
import {
  ConsultarExistenciasUseCase,
  CrearMedicamentoUseCase,
  ListarMedicamentosUseCase,
  RegistrarExistenciaUseCase,
} from "./medicamentos.use-cases";
import { MarcarNotificacionLeidaUseCase, MisNotificacionesUseCase } from "./notificaciones.use-cases";
import { nivelDisponibilidad } from "../../domain/entities/medicamento";

describe("casos de uso de la lista de espera", () => {
  const repo = (): ListaEsperaRepository => ({ unirse: vi.fn(), misInscripciones: vi.fn(), salir: vi.fn() });

  it("unirse exige sede y servicio", () => {
    const r = repo();
    expect(() => new UnirseListaEsperaUseCase(r).ejecutar("", "p1")).toThrow(AppError);
    expect(() => new UnirseListaEsperaUseCase(r).ejecutar("s1", "")).toThrow(AppError);
    expect(r.unirse).not.toHaveBeenCalled();
  });

  it("unirse, misInscripciones y salir delegan en el repositorio", async () => {
    const r = repo();
    await new UnirseListaEsperaUseCase(r).ejecutar("s1", "p1");
    await new MisInscripcionesEsperaUseCase(r).ejecutar();
    await new SalirListaEsperaUseCase(r).ejecutar("l1");

    expect(r.unirse).toHaveBeenCalledWith("s1", "p1");
    expect(r.misInscripciones).toHaveBeenCalled();
    expect(r.salir).toHaveBeenCalledWith("l1");
  });
});

describe("casos de uso de notificaciones", () => {
  it("delegan en el repositorio", async () => {
    const r: NotificacionRepository = { misNotificaciones: vi.fn(), marcarLeida: vi.fn() };

    await new MisNotificacionesUseCase(r).ejecutar();
    await new MarcarNotificacionLeidaUseCase(r).ejecutar("n1");

    expect(r.misNotificaciones).toHaveBeenCalled();
    expect(r.marcarLeida).toHaveBeenCalledWith("n1");
  });
});

describe("casos de uso de medicamentos e inventario", () => {
  const repo = (): MedicamentoRepository => ({
    listar: vi.fn(),
    crear: vi.fn(),
    existenciasPorPunto: vi.fn(),
    registrarExistencia: vi.fn(),
  });
  const medicamento = { codigoNacional: "C1", nombreGenerico: "Losartán", concentracion: "50 mg", presentacion: "Tabletas", laboratorioFabricante: "Lab" };
  const existencia = { puntoId: "p1", medicamentoId: "m1", lote: "L1", stockActual: 10, fechaVencimiento: "2027-01-01T00:00:00.000Z" };

  it("listar y consultar existencias delegan; sin sede se rechaza", async () => {
    const r = repo();
    await new ListarMedicamentosUseCase(r).ejecutar();
    await new ConsultarExistenciasUseCase(r).ejecutar("p1", "m1");

    expect(r.listar).toHaveBeenCalled();
    expect(r.existenciasPorPunto).toHaveBeenCalledWith("p1", "m1");
    expect(() => new ConsultarExistenciasUseCase(r).ejecutar("")).toThrow(AppError);
  });

  it("crear valida los campos obligatorios", async () => {
    const r = repo();
    expect(() => new CrearMedicamentoUseCase(r).ejecutar({ ...medicamento, nombreGenerico: " ", codigoNacional: "" })).toThrow(AppError);
    await new CrearMedicamentoUseCase(r).ejecutar(medicamento);
    expect(r.crear).toHaveBeenCalledWith(medicamento);
  });

  it("registrarExistencia valida unidades, lote y fecha", async () => {
    const r = repo();
    expect(() => new RegistrarExistenciaUseCase(r).ejecutar({ ...existencia, stockActual: -1, lote: " ", fechaVencimiento: "" })).toThrow(AppError);
    await new RegistrarExistenciaUseCase(r).ejecutar(existencia);
    expect(r.registrarExistencia).toHaveBeenCalledWith(existencia);
  });

  it("nivelDisponibilidad clasifica agotado, baja y disponible", () => {
    expect(nivelDisponibilidad(0)).toBe("AGOTADO");
    expect(nivelDisponibilidad(50)).toBe("BAJA");
    expect(nivelDisponibilidad(500)).toBe("DISPONIBLE");
  });
});
