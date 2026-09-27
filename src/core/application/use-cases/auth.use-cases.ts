import type { AuthRepository } from "../../domain/ports";
import type { Credenciales, DatosRegistro } from "../../domain/entities/usuario";
import { AppError } from "../../domain/errors";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Mismas reglas que LoginDto (IsEmail, IsString). */
export function validarCredenciales(c: Credenciales): string[] {
  const errores: string[] = [];
  if (!EMAIL_RE.test(c.email.trim())) errores.push("Ingresa un correo electrónico válido.");
  if (!c.password) errores.push("Ingresa tu contraseña.");
  return errores;
}

/** Mismas reglas que RegisterDto (IsString, IsEmail, MinLength(6)). */
export function validarRegistro(d: DatosRegistro): string[] {
  const errores: string[] = [];
  if (!d.nombre.trim()) errores.push("Ingresa tu nombre.");
  if (!EMAIL_RE.test(d.email.trim())) errores.push("Ingresa un correo electrónico válido.");
  if (d.password.length < 6) errores.push("La contraseña debe tener al menos 6 caracteres.");
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
      nombre: d.nombre.trim(),
      email: d.email.trim().toLowerCase(),
      password: d.password,
    });
  }
}

export class CerrarSesionUseCase {
  constructor(private readonly repo: AuthRepository) {}
  ejecutar() {
    return this.repo.cerrarSesion();
  }
}
