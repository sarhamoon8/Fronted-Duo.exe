import { describe, expect, it, vi } from "vitest";
import type { AuthRepository } from "../../domain/ports";
import type { Sesion } from "../../domain/entities/sesion";
import { AppError } from "../../domain/errors";
import {
  CerrarSesionUseCase,
  IniciarSesionUseCase,
  RegistrarseUseCase,
  validarCredenciales,
  validarRegistro,
} from "./auth.use-cases";

function crearRepoFalso(overrides: Partial<AuthRepository> = {}): AuthRepository {
  return {
    iniciarSesion: vi.fn(),
    registrarse: vi.fn(),
    cerrarSesion: vi.fn(),
    obtenerSesion: vi.fn(),
    ...overrides,
  };
}

const sesion: Sesion = { id: "u1", nombre: "Ana", email: "ana@example.com", rol: "PACIENTE", expiraEn: null };

describe("validarCredenciales", () => {
  it("rechaza un email con formato inválido", () => {
    expect(validarCredenciales({ email: "no-es-un-email", password: "clave123" })).toContain(
      "Ingresa un correo electrónico válido.",
    );
  });

  it("rechaza una contraseña vacía", () => {
    expect(validarCredenciales({ email: "a@b.com", password: "" })).toContain(
      "Ingresa tu contraseña.",
    );
  });

  it("no devuelve errores con datos válidos", () => {
    expect(validarCredenciales({ email: "a@b.com", password: "clave123" })).toEqual([]);
  });
});

describe("validarRegistro", () => {
  const datosValidos = {
    numeroDocumento: "123",
    tipoDocumento: "CC",
    nombres: "Ana",
    apellidos: "Pérez",
    email: "ana@example.com",
    password: "clave123",
  };

  it("no devuelve errores con datos válidos", () => {
    expect(validarRegistro(datosValidos)).toEqual([]);
  });

  it("rechaza una contraseña de menos de 6 caracteres", () => {
    expect(validarRegistro({ ...datosValidos, password: "123" })).toContain(
      "La contraseña debe tener al menos 6 caracteres.",
    );
  });

  it("acumula todos los errores de campos vacíos a la vez", () => {
    const errores = validarRegistro({
      numeroDocumento: "",
      tipoDocumento: "",
      nombres: "",
      apellidos: "",
      email: "x",
      password: "",
    });
    expect(errores.length).toBeGreaterThanOrEqual(5);
  });
});

describe("IniciarSesionUseCase", () => {
  it("lanza AppError 400 sin llamar al repositorio si las credenciales son inválidas", async () => {
    const repo = crearRepoFalso();
    const useCase = new IniciarSesionUseCase(repo);

    await expect(useCase.ejecutar({ email: "x", password: "" })).rejects.toBeInstanceOf(AppError);
    expect(repo.iniciarSesion).not.toHaveBeenCalled();
  });

  it("normaliza el email (trim + minúsculas) antes de delegar en el repositorio", async () => {
    const repo = crearRepoFalso({ iniciarSesion: vi.fn().mockResolvedValue(sesion) });
    const useCase = new IniciarSesionUseCase(repo);

    await useCase.ejecutar({ email: "  Ana@Example.com  ", password: "clave123" });

    expect(repo.iniciarSesion).toHaveBeenCalledWith({ email: "ana@example.com", password: "clave123" });
  });
});

describe("RegistrarseUseCase", () => {
  it("lanza AppError 400 sin llamar al repositorio si el registro es inválido", async () => {
    const repo = crearRepoFalso();
    const useCase = new RegistrarseUseCase(repo);

    await expect(
      useCase.ejecutar({
        numeroDocumento: "",
        tipoDocumento: "CC",
        nombres: "Ana",
        apellidos: "Pérez",
        email: "ana@example.com",
        password: "clave123",
      }),
    ).rejects.toBeInstanceOf(AppError);
    expect(repo.registrarse).not.toHaveBeenCalled();
  });

  it("recorta espacios y normaliza el email antes de delegar en el repositorio", async () => {
    const repo = crearRepoFalso({ registrarse: vi.fn().mockResolvedValue(sesion) });
    const useCase = new RegistrarseUseCase(repo);

    await useCase.ejecutar({
      numeroDocumento: " 123 ",
      tipoDocumento: " CC ",
      nombres: " Ana ",
      apellidos: " Pérez ",
      email: " Ana@Example.com ",
      password: "clave123",
      telefono: "  ",
    });

    expect(repo.registrarse).toHaveBeenCalledWith({
      numeroDocumento: "123",
      tipoDocumento: "CC",
      nombres: "Ana",
      apellidos: "Pérez",
      email: "ana@example.com",
      password: "clave123",
      telefono: undefined,
    });
  });
});

describe("CerrarSesionUseCase", () => {
  it("delega en authRepository.cerrarSesion", () => {
    const repo = crearRepoFalso();
    const useCase = new CerrarSesionUseCase(repo);

    useCase.ejecutar();

    expect(repo.cerrarSesion).toHaveBeenCalledTimes(1);
  });
});
