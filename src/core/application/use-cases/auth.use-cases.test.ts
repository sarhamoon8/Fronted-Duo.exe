import { describe, expect, it, vi } from "vitest";
import type { AuthRepository } from "../../domain/ports";
import type { Sesion } from "../../domain/entities/sesion";
import { AppError } from "../../domain/errors";
import {
  AccederConGoogleUseCase,
  CerrarSesionUseCase,
  IniciarSesionUseCase,
  RegistrarseUseCase,
  validarCredenciales,
  validarAccesoGoogle,
  validarRegistro,
} from "./auth.use-cases";

function crearRepoFalso(overrides: Partial<AuthRepository> = {}): AuthRepository {
  return {
    iniciarSesion: vi.fn(),
    registrarse: vi.fn(),
    accederConGoogle: vi.fn(),
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
    password: "Clave123!",
    aceptaTerminos: true,
  };

  it("no devuelve errores con datos válidos", () => {
    expect(validarRegistro(datosValidos)).toEqual([]);
  });

  it("pide todos los requisitos de la contraseña que no se cumplen", () => {
    expect(validarRegistro({ ...datosValidos, password: "abc" })).toContain(
      "La contraseña debe tener al menos 8 caracteres, una letra mayúscula, un número, un símbolo especial (!, @ o #).",
    );
  });

  it.each([
    ["Clave12!", []],
    ["Clave12#", []],
    ["clave123!", ["una letra mayúscula"]],
    ["CLAVE123!", ["una letra minúscula"]],
    ["ClaveClave!", ["un número"]],
    ["Clave12345", ["un símbolo especial (!, @ o #)"]],
    ["Clave123$", ["un símbolo especial (!, @ o #)"]],
    ["Cl1!", ["al menos 8 caracteres"]],
  ])("contraseña %s: le falta %j", (password, faltan) => {
    const errores = validarRegistro({ ...datosValidos, password });
    expect(errores).toEqual(faltan.length ? [`La contraseña debe tener ${faltan.join(", ")}.`] : []);
  });

  it("exige aceptar los términos y la política de privacidad", () => {
    expect(validarRegistro({ ...datosValidos, aceptaTerminos: false })).toEqual([
      "Debes aceptar los términos de uso y la política de privacidad.",
    ]);
  });

  it("acumula todos los errores de campos vacíos a la vez", () => {
    const errores = validarRegistro({
      numeroDocumento: "",
      tipoDocumento: "",
      nombres: "",
      apellidos: "",
      email: "x",
      password: "",
      aceptaTerminos: false,
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
        password: "Clave123!",
        aceptaTerminos: true,
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
      password: "Clave123!",
      telefono: "  ",
      aceptaTerminos: true,
    });

    expect(repo.registrarse).toHaveBeenCalledWith({
      numeroDocumento: "123",
      tipoDocumento: "CC",
      nombres: "Ana",
      apellidos: "Pérez",
      email: "ana@example.com",
      password: "Clave123!",
      telefono: undefined,
      aceptaTerminos: true,
    });
  });
});

describe("validarAccesoGoogle", () => {
  it("acepta solo el token de Google (inicio de sesión o primer paso)", () => {
    expect(validarAccesoGoogle({ credential: "token" })).toEqual([]);
  });

  it("exige el token de Google", () => {
    expect(validarAccesoGoogle({ credential: "" })).toHaveLength(1);
  });

  it("al completar el registro exige documento, nombres, apellidos y términos", () => {
    expect(
      validarAccesoGoogle({
        credential: "token",
        numeroDocumento: "",
        tipoDocumento: "",
        nombres: "",
        apellidos: "",
        aceptaTerminos: false,
      }),
    ).toEqual([
      "Ingresa tu número de documento.",
      "Selecciona tu tipo de documento.",
      "Ingresa tus nombres.",
      "Ingresa tus apellidos.",
      "Debes aceptar los términos de uso y la política de privacidad.",
    ]);
  });
});

describe("AccederConGoogleUseCase", () => {
  it("con solo el token delega sin datos de registro", async () => {
    const repo = crearRepoFalso({ accederConGoogle: vi.fn().mockResolvedValue({ tipo: "sesion", sesion }) });

    const resultado = await new AccederConGoogleUseCase(repo).ejecutar({ credential: "token" });

    expect(repo.accederConGoogle).toHaveBeenCalledWith({ credential: "token" });
    expect(resultado).toEqual({ tipo: "sesion", sesion });
  });

  it("devuelve el perfil cuando faltan datos para crear la cuenta", async () => {
    const perfil = { email: "ana@gmail.com", nombres: "Ana", apellidos: "Pérez" };
    const repo = crearRepoFalso({ accederConGoogle: vi.fn().mockResolvedValue({ tipo: "incompleto", perfil }) });

    expect(await new AccederConGoogleUseCase(repo).ejecutar({ credential: "token" })).toEqual({ tipo: "incompleto", perfil });
  });

  it("al completar el registro recorta los datos y envía la aceptación", async () => {
    const repo = crearRepoFalso({ accederConGoogle: vi.fn().mockResolvedValue({ tipo: "sesion", sesion }) });

    await new AccederConGoogleUseCase(repo).ejecutar({
      credential: "token",
      numeroDocumento: " 555 ",
      tipoDocumento: "CC",
      nombres: " Ana ",
      apellidos: " Pérez ",
      telefono: "  ",
      aceptaTerminos: true,
    });

    expect(repo.accederConGoogle).toHaveBeenCalledWith({
      credential: "token",
      numeroDocumento: "555",
      tipoDocumento: "CC",
      nombres: "Ana",
      apellidos: "Pérez",
      telefono: undefined,
      aceptaTerminos: true,
    });
  });

  it("lanza AppError 400 sin llamar al repositorio si falta aceptar los términos", async () => {
    const repo = crearRepoFalso();

    await expect(
      new AccederConGoogleUseCase(repo).ejecutar({ credential: "token", numeroDocumento: "555", tipoDocumento: "CC", aceptaTerminos: false }),
    ).rejects.toBeInstanceOf(AppError);
    expect(repo.accederConGoogle).not.toHaveBeenCalled();
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
