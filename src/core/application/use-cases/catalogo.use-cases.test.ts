import { describe, expect, it, vi } from "vitest";
import type { CatalogoRepository, UsuarioRepository } from "../../domain/ports";
import { AppError } from "../../domain/errors";
import {
  CrearEntidadUseCase,
  CrearPuntoUseCase,
  CrearServicioUseCase,
  CrearUsuarioUseCase,
  ListarEntidadesUseCase,
  ListarPuntosUseCase,
  ListarServiciosUseCase,
  ListarUsuariosUseCase,
} from "./catalogo.use-cases";

function crearCatalogoRepoFalso(overrides: Partial<CatalogoRepository> = {}): CatalogoRepository {
  return {
    listarEntidades: vi.fn(),
    crearEntidad: vi.fn(),
    listarServicios: vi.fn(),
    crearServicio: vi.fn(),
    listarPuntos: vi.fn(),
    crearPunto: vi.fn(),
    ...overrides,
  };
}

function crearUsuarioRepoFalso(overrides: Partial<UsuarioRepository> = {}): UsuarioRepository {
  return {
    listar: vi.fn(),
    crear: vi.fn(),
    ...overrides,
  };
}

describe("ListarEntidadesUseCase / ListarServiciosUseCase / ListarPuntosUseCase", () => {
  it("delegan directamente en el repositorio", async () => {
    const repo = crearCatalogoRepoFalso({
      listarEntidades: vi.fn().mockResolvedValue([]),
      listarServicios: vi.fn().mockResolvedValue([]),
      listarPuntos: vi.fn().mockResolvedValue([]),
    });

    await new ListarEntidadesUseCase(repo).ejecutar();
    await new ListarServiciosUseCase(repo).ejecutar("entidad-1");
    await new ListarPuntosUseCase(repo).ejecutar("entidad-1");

    expect(repo.listarEntidades).toHaveBeenCalled();
    expect(repo.listarServicios).toHaveBeenCalledWith("entidad-1");
    expect(repo.listarPuntos).toHaveBeenCalledWith("entidad-1");
  });
});

describe("CrearEntidadUseCase", () => {
  it("rechaza un nombre vacío sin llamar al repositorio", () => {
    const repo = crearCatalogoRepoFalso();
    const useCase = new CrearEntidadUseCase(repo);

    expect(() => useCase.ejecutar("   ")).toThrow(AppError);
    expect(repo.crearEntidad).not.toHaveBeenCalled();
  });

  it("recorta espacios antes de delegar en el repositorio", () => {
    const repo = crearCatalogoRepoFalso();
    const useCase = new CrearEntidadUseCase(repo);

    useCase.ejecutar("  Sanitas EPS  ");

    expect(repo.crearEntidad).toHaveBeenCalledWith("Sanitas EPS");
  });
});

describe("CrearServicioUseCase", () => {
  it("acumula los errores de validación (código, nombre, tiempo, entidad)", () => {
    const repo = crearCatalogoRepoFalso();
    const useCase = new CrearServicioUseCase(repo);

    expect(() => useCase.ejecutar("", "", 0, "")).toThrow(AppError);
    expect(repo.crearServicio).not.toHaveBeenCalled();
  });

  it("rechaza un tiempoPromedioMin no entero o menor a 1", () => {
    const repo = crearCatalogoRepoFalso();
    const useCase = new CrearServicioUseCase(repo);

    expect(() => useCase.ejecutar("COD-1", "Servicio", 0, "entidad-1")).toThrow(AppError);
    expect(() => useCase.ejecutar("COD-1", "Servicio", 1.5, "entidad-1")).toThrow(AppError);
  });

  it("crea el servicio con datos válidos", () => {
    const repo = crearCatalogoRepoFalso();
    const useCase = new CrearServicioUseCase(repo);

    useCase.ejecutar(" COD-1 ", " Servicio ", 10, "entidad-1");

    expect(repo.crearServicio).toHaveBeenCalledWith("COD-1", "Servicio", 10, "entidad-1");
  });
});

describe("ListarUsuariosUseCase", () => {
  it("delega en usuarioRepository.listar", async () => {
    const repo = crearUsuarioRepoFalso({ listar: vi.fn().mockResolvedValue([]) });

    await new ListarUsuariosUseCase(repo).ejecutar();

    expect(repo.listar).toHaveBeenCalledTimes(1);
  });
});

describe("CrearUsuarioUseCase", () => {
  const datosValidos = {
    numeroDocumento: "123",
    tipoDocumento: "CC",
    nombres: "Ana",
    apellidos: "Pérez",
    email: "ana@example.com",
    password: "clave123",
  };

  it("reutiliza las reglas de validarRegistro (contraseña corta rechazada)", () => {
    const repo = crearUsuarioRepoFalso();
    const useCase = new CrearUsuarioUseCase(repo);

    expect(() => useCase.ejecutar({ ...datosValidos, password: "123" })).toThrow(AppError);
    expect(repo.crear).not.toHaveBeenCalled();
  });

  it("normaliza los datos antes de delegar en el repositorio", () => {
    const repo = crearUsuarioRepoFalso();
    const useCase = new CrearUsuarioUseCase(repo);

    useCase.ejecutar({ ...datosValidos, email: " Ana@Example.com ", telefono: "  " });

    expect(repo.crear).toHaveBeenCalledWith(
      expect.objectContaining({ email: "ana@example.com", telefono: undefined }),
    );
  });
});

describe("CrearPuntoUseCase", () => {
  const datos = { entidadId: "e1", nombreSede: "Sede Norte", direccion: "Calle 1", ciudad: "Bogotá", capacidadAtencion: 20 };

  it("valida los campos obligatorios y la capacidad", () => {
    const repo = crearCatalogoRepoFalso();
    const useCase = new CrearPuntoUseCase(repo);

    expect(() => useCase.ejecutar({ ...datos, entidadId: "", nombreSede: " ", capacidadAtencion: 0 })).toThrow(AppError);
    expect(repo.crearPunto).not.toHaveBeenCalled();
  });

  it("delega en el repositorio cuando los datos son válidos", async () => {
    const repo = crearCatalogoRepoFalso({ crearPunto: vi.fn().mockResolvedValue({ id: "p1", ...datos, telefonoContacto: null }) });
    const useCase = new CrearPuntoUseCase(repo);

    const creado = await useCase.ejecutar(datos);

    expect(repo.crearPunto).toHaveBeenCalledWith(datos);
    expect(creado.id).toBe("p1");
  });
});
