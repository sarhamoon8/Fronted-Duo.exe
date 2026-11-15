import type { AuthRepository } from "../../domain/ports";
import type { Credenciales, DatosRegistro } from "../../domain/entities/usuario";
import { AppError } from "../../domain/errors";
import { reglasIncumplidas } from "../../domain/password";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Mismas reglas que LoginDto (IsEmail, IsString). */
export function validarCredenciales(c: Credenciales): string[] {
  const errores: string[] = [];
  if (!EMAIL_RE.test(c.email.trim())) errores.push("Ingresa un correo electrónico válido.");
  if (!c.password) errores.push("Ingresa tu contraseña.");
  return errores;
}

type DatosPersona = Pick<DatosRegistro, "numeroDocumento" | "tipoDocumento" | "nombres" | "apellidos" | "email">;

/** Datos de identidad comunes a RegisterDto y CrearUsuarioDto (IsString, IsEmail). */
export function validarDatosPersona(d: DatosPersona): string[] {
  const errores: string[] = [];
  if (!d.numeroDocumento.trim()) errores.push("Ingresa tu número de documento.");
  if (!d.tipoDocumento.trim()) errores.push("Selecciona tu tipo de documento.");
  if (!d.nombres.trim()) errores.push("Ingresa tus nombres.");
  if (!d.apellidos.trim()) errores.push("Ingresa tus apellidos.");
  if (!EMAIL_RE.test(d.email.trim())) errores.push("Ingresa un correo electrónico válido.");
  return errores;
}

/** Mismas reglas que RegisterDto: datos de la persona, contraseña con requisitos y términos aceptados. */
export function validarRegistro(d: DatosRegistro): string[] {
  const errores = validarDatosPersona(d);
  const faltan = reglasIncumplidas(d.password);
  if (faltan.length) errores.push(`La contraseña debe tener ${faltan.map((r) => r.falta).join(", ")}.`);
  if (!d.aceptaTerminos) errores.push("Debes aceptar los términos de uso y la política de privacidad.");
  return errores;
}

export class IniciarSesionUseCase {
  constructor(private readonly repo: AuthRepository) {}
  async ejecutar(c: Credenciales) {
    const errores = validarCredenciales(c);
    if (errores.length) throw new AppError(errores, 400);
    return this.repo.iniciarSesion({ email: c.email.trim().toLowerCase(), password: c.password });
  }
}

export class RegistrarseUseCase {
  constructor(private readonly repo: AuthRepository) {}
  async ejecutar(d: DatosRegistro) {
    const errores = validarRegistro(d);
    if (errores.length) throw new AppError(errores, 400);
    return this.repo.registrarse({
      numeroDocumento: d.numeroDocumento.trim(),
      tipoDocumento: d.tipoDocumento.trim(),
      nombres: d.nombres.trim(),
      apellidos: d.apellidos.trim(),
      email: d.email.trim().toLowerCase(),
      password: d.password,
      telefono: d.telefono?.trim() || undefined,
      aceptaTerminos: d.aceptaTerminos,
    });
  }
}

export class CerrarSesionUseCase {
  constructor(private readonly repo: AuthRepository) {}
  ejecutar() {
    return this.repo.cerrarSesion();
  }
}
