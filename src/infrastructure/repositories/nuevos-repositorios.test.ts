import { beforeEach, describe, expect, it, vi } from "vitest";
import { internalApi } from "../http/internal-client";
import { HttpCatalogoRepository } from "./catalogo.repository";
import { HttpListaEsperaRepository } from "./lista-espera.repository";
import { HttpMedicamentoRepository } from "./medicamento.repository";
import { HttpNotificacionRepository } from "./notificacion.repository";

vi.mock("../http/internal-client", () => ({
  internalApi: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

beforeEach(() => {
  for (const metodo of ["get", "post", "patch", "delete"] as const) vi.mocked(internalApi[metodo]).mockReset();
});

describe("HttpCatalogoRepository.crearPunto", () => {
  it("llama a POST /bff/puntos-dispensacion", async () => {
    const datos = { entidadId: "e1", nombreSede: "Sede", direccion: "Calle 1", ciudad: "Bogotá", capacidadAtencion: 10 };
    vi.mocked(internalApi.post).mockResolvedValue({ data: { id: "p1", ...datos, telefonoContacto: null } });

    const resultado = await new HttpCatalogoRepository().crearPunto(datos);

    expect(internalApi.post).toHaveBeenCalledWith("/bff/puntos-dispensacion", datos);
    expect(resultado.id).toBe("p1");
  });
});

describe("HttpListaEsperaRepository", () => {
  const dto = { id: "l1", usuarioId: "u1", servicioId: "s1", puntoId: "p1", creadoEn: "2026-01-01T00:00:00.000Z", posicion: 3 };

  it("unirse llama a POST /bff/lista-espera y mapea la fecha", async () => {
    vi.mocked(internalApi.post).mockResolvedValue({ data: dto });

    const resultado = await new HttpListaEsperaRepository().unirse("s1", "p1");

    expect(internalApi.post).toHaveBeenCalledWith("/bff/lista-espera", { servicioId: "s1", puntoId: "p1" });
    expect(resultado.posicion).toBe(3);
    expect(resultado.creadoEn).toBeInstanceOf(Date);
  });

  it("misInscripciones llama a GET /bff/lista-espera/mis-inscripciones", async () => {
    vi.mocked(internalApi.get).mockResolvedValue({ data: [dto] });

    const resultado = await new HttpListaEsperaRepository().misInscripciones();

    expect(internalApi.get).toHaveBeenCalledWith("/bff/lista-espera/mis-inscripciones");
    expect(resultado).toHaveLength(1);
  });

  it("salir llama a DELETE /bff/lista-espera/:id", async () => {
    vi.mocked(internalApi.delete).mockResolvedValue({ data: undefined });

    await new HttpListaEsperaRepository().salir("l 1");

    expect(internalApi.delete).toHaveBeenCalledWith("/bff/lista-espera/l%201");
  });
});

describe("HttpNotificacionRepository", () => {
  const dto = {
    id: "n1",
    tipo: "TURNO_CREADO",
    titulo: "Turno creado",
    mensaje: "Tu turno fue creado",
    estadoEnvio: "ENVIADA",
    leida: false,
    creadoEn: "2026-01-01T00:00:00.000Z",
  };

  it("misNotificaciones llama a GET /bff/notificaciones/mis-notificaciones", async () => {
    vi.mocked(internalApi.get).mockResolvedValue({ data: [dto] });

    const resultado = await new HttpNotificacionRepository().misNotificaciones();

    expect(internalApi.get).toHaveBeenCalledWith("/bff/notificaciones/mis-notificaciones");
    expect(resultado[0]!.creadoEn).toBeInstanceOf(Date);
  });

  it("marcarLeida llama a PATCH /bff/notificaciones/:id/leida", async () => {
    vi.mocked(internalApi.patch).mockResolvedValue({ data: { ...dto, leida: true } });

    const resultado = await new HttpNotificacionRepository().marcarLeida("n1");

    expect(internalApi.patch).toHaveBeenCalledWith("/bff/notificaciones/n1/leida");
    expect(resultado.leida).toBe(true);
  });
});

describe("HttpMedicamentoRepository", () => {
  it("listar llama a GET /bff/medicamentos", async () => {
    vi.mocked(internalApi.get).mockResolvedValue({ data: [{ id: "m1" }] });

    const resultado = await new HttpMedicamentoRepository().listar();

    expect(internalApi.get).toHaveBeenCalledWith("/bff/medicamentos");
    expect(resultado).toHaveLength(1);
  });

  it("existenciasPorPunto manda puntoId y, si existe, medicamentoId", async () => {
    vi.mocked(internalApi.get).mockResolvedValue({
      data: [{ id: "i1", puntoId: "p1", medicamentoId: "m1", lote: "L1", stockActual: 10, stockReservado: 0, cantidadDisponible: 10, disponible: true, fechaVencimiento: "2027-01-01T00:00:00.000Z" }],
    });
    const repo = new HttpMedicamentoRepository();

    const resultado = await repo.existenciasPorPunto("p1");
    await repo.existenciasPorPunto("p1", "m1");

    expect(internalApi.get).toHaveBeenNthCalledWith(1, "/bff/inventario", { params: { puntoId: "p1" } });
    expect(internalApi.get).toHaveBeenNthCalledWith(2, "/bff/inventario", { params: { puntoId: "p1", medicamentoId: "m1" } });
    expect(resultado[0]!.fechaVencimiento).toBeInstanceOf(Date);
  });

  it("crear y registrarExistencia llaman a los POST correspondientes", async () => {
    vi.mocked(internalApi.post).mockResolvedValue({
      data: { id: "x", fechaVencimiento: "2027-01-01T00:00:00.000Z" },
    });
    const repo = new HttpMedicamentoRepository();
    const medicamento = { codigoNacional: "C1", nombreGenerico: "A", concentracion: "1", presentacion: "T", laboratorioFabricante: "L" };
    const existencia = { puntoId: "p1", medicamentoId: "m1", lote: "L1", stockActual: 5, fechaVencimiento: "2027-01-01T00:00:00.000Z" };

    await repo.crear(medicamento);
    await repo.registrarExistencia(existencia);

    expect(internalApi.post).toHaveBeenNthCalledWith(1, "/bff/medicamentos", medicamento);
    expect(internalApi.post).toHaveBeenNthCalledWith(2, "/bff/inventario", existencia);
  });
});
