import { describe, expect, it, vi, beforeEach } from "vitest";
import { internalApi } from "../http/internal-client";
import { HttpCatalogoRepository } from "./catalogo.repository";

vi.mock("../http/internal-client", () => ({
  internalApi: { get: vi.fn(), post: vi.fn() },
}));

describe("HttpCatalogoRepository", () => {
  beforeEach(() => {
    vi.mocked(internalApi.get).mockReset();
    vi.mocked(internalApi.post).mockReset();
  });

  it("listarEntidades llama a GET /bff/entidades-medicas", async () => {
    const entidades = [{ id: "e1", nombre: "Nueva EPS" }];
    vi.mocked(internalApi.get).mockResolvedValue({ data: entidades });
    const repo = new HttpCatalogoRepository();

    await expect(repo.listarEntidades()).resolves.toEqual(entidades);
    expect(internalApi.get).toHaveBeenCalledWith("/bff/entidades-medicas");
  });

  it("crearEntidad llama a POST /bff/entidades-medicas con el nombre", async () => {
    const creada = { id: "e1", nombre: "Nueva EPS" };
    vi.mocked(internalApi.post).mockResolvedValue({ data: creada });
    const repo = new HttpCatalogoRepository();

    await expect(repo.crearEntidad("Nueva EPS")).resolves.toEqual(creada);
    expect(internalApi.post).toHaveBeenCalledWith("/bff/entidades-medicas", { nombre: "Nueva EPS" });
  });

  it("listarServicios sin entidadId no manda params", async () => {
    vi.mocked(internalApi.get).mockResolvedValue({ data: [] });
    const repo = new HttpCatalogoRepository();

    await repo.listarServicios();

    expect(internalApi.get).toHaveBeenCalledWith("/bff/servicios", { params: undefined });
  });

  it("listarServicios con entidadId lo manda como param", async () => {
    vi.mocked(internalApi.get).mockResolvedValue({ data: [] });
    const repo = new HttpCatalogoRepository();

    await repo.listarServicios("entidad-1");

    expect(internalApi.get).toHaveBeenCalledWith("/bff/servicios", { params: { entidadId: "entidad-1" } });
  });

  it("crearServicio manda todos los campos al BFF", async () => {
    const creado = { id: "s1", nombre: "Servicio", entidadId: "entidad-1" };
    vi.mocked(internalApi.post).mockResolvedValue({ data: creado });
    const repo = new HttpCatalogoRepository();

    await expect(repo.crearServicio("COD-1", "Servicio", 10, "entidad-1")).resolves.toEqual(creado);
    expect(internalApi.post).toHaveBeenCalledWith("/bff/servicios", {
      codigoServicio: "COD-1",
      nombre: "Servicio",
      tiempoPromedioMin: 10,
      entidadId: "entidad-1",
    });
  });

  it("listarPuntos con entidadId lo manda como param, sin él no", async () => {
    vi.mocked(internalApi.get).mockResolvedValue({ data: [] });
    const repo = new HttpCatalogoRepository();

    await repo.listarPuntos("entidad-1");
    expect(internalApi.get).toHaveBeenCalledWith("/bff/puntos-dispensacion", {
      params: { entidadId: "entidad-1" },
    });

    await repo.listarPuntos();
    expect(internalApi.get).toHaveBeenCalledWith("/bff/puntos-dispensacion", { params: undefined });
  });
});
