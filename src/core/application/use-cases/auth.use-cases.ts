import type { AuthRepository } from "../../domain/ports";
import type { Credenciales, DatosGoogle, DatosRegistro } from "../../domain/entities/usuario";
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

/** "La contraseña debe tener …" con los requisitos que faltan, o null si los cumple todos (mismos que el backend). */
function mensajeRequisitosPassword(password: string): string | null {
  const faltan = reglasIncumplidas(password);
  return faltan.length ? `La contraseña debe tener ${faltan.map((r) => r.falta).join(", ")}.` : null;
}

/** Mismas reglas que RegisterDto: datos de la persona, contraseña con requisitos y términos aceptados. */
export function validarRegistro(d: DatosRegistro): string[] {
  const errores = validarDatosPersona(d);
  const requisitos = mensajeRequisitosPassword(d.password);
  if (requisitos) errores.push(requisitos);
  if (!d.aceptaTerminos) errores.push("Debes aceptar los términos de uso y la política de privacidad.");
  return errores;
}

/** Mismas reglas que SolicitarRecuperacionDto (IsEmail). */
export function validarSolicitudRecuperacion(email: string): string[] {
  return EMAIL_RE.test(email.trim()) ? [] : ["Ingresa un correo electrónico válido."];
}

/** Mismas reglas que RestablecerPasswordDto, más que las dos contraseñas coincidan. */
export function validarNuevaPassword(d: { password: string; confirmacion: string }): string[] {
  const errores: string[] = [];
  const requisitos = mensajeRequisitosPassword(d.password);
  if (requisitos) errores.push(requisitos);
  if (d.password !== d.confirmacion) errores.push("Las contraseñas no coinciden.");
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

/** Mismas reglas que GoogleAuthDto: con documento se está creando la cuenta, y eso exige los términos. */
export function validarAccesoGoogle(d: DatosGoogle): string[] {
  const errores: string[] = [];
  if (!d.credential) errores.push("No se recibió la autorización de Google. Intenta de nuevo.");
  if (d.numeroDocumento !== undefined) {
    if (!d.numeroDocumento.trim()) errores.push("Ingresa tu número de documento.");
    if (!d.tipoDocumento?.trim()) errores.push("Selecciona tu tipo de documento.");
    if (d.nombres !== undefined && !d.nombres.trim()) errores.push("Ingresa tus nombres.");
    if (d.apellidos !== undefined && !d.apellidos.trim()) errores.push("Ingresa tus apellidos.");
    if (!d.aceptaTerminos) errores.push("Debes aceptar los términos de uso y la política de privacidad.");
  }
  return errores;
}

/** Continuar con Google: inicia sesión si el correo ya tiene cuenta; si no, devuelve el perfil para completar el registro. */
export class AccederConGoogleUseCase {
  constructor(private readonly repo: AuthRepository) {}
  async ejecutar(d: DatosGoogle) {
    const errores = validarAccesoGoogle(d);
    if (errores.length) throw new AppError(errores, 400);
    return this.repo.accederConGoogle({
      credential: d.credential,
      ...(d.numeroDocumento !== undefined && {
        numeroDocumento: d.numeroDocumento.trim(),
        tipoDocumento: d.tipoDocumento?.trim(),
        nombres: d.nombres?.trim(),
        apellidos: d.apellidos?.trim(),
        telefono: d.telefono?.trim() || undefined,
        aceptaTerminos: d.aceptaTerminos,
      }),
    });
  }
}

/** Pide el correo con el enlace para cambiar la contraseña (el backend responde igual exista o no la cuenta). */
export class SolicitarRecuperacionUseCase {
  constructor(private readonly repo: AuthRepository) {}
  async ejecutar(email: string) {
    const errores = validarSolicitudRecuperacion(email);
    if (errores.length) throw new AppError(errores, 400);
    return this.repo.solicitarRecuperacion(email.trim().toLowerCase());
  }
}

/** Define la contraseña nueva con el token del enlace. */
export class RestablecerPasswordUseCase {
  constructor(private readonly repo: AuthRepository) {}
  async ejecutar(d: { token: string; password: string; confirmacion: string }) {
    const errores = validarNuevaPassword(d);
    if (errores.length) throw new AppError(errores, 400);
    return this.repo.restablecerPassword(d.token, d.password);
  }
}

export class CerrarSesionUseCase {
  constructor(private readonly repo: AuthRepository) {}
  ejecutar() {
    return this.repo.cerrarSesion();
  }
}
